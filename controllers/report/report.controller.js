//dayjs
const dayjs = require('dayjs');
//รายรับ
const {Deliivery} = require('../../models/order/delivery.schema');
//รายจ่าย
const {Withdrawmoney} = require('../../models/withdrawmoney/withdrawmoney.schema');
//สินค้า
const {Product} = require('../../models/product/product.schema');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// dashboard พาร์ทเนอร์
module.exports.dashboardpartner = async (req, res) => {
    try{
        //ยอดขายประจำวัน
        const id = new ObjectId(req.params.id);
        
        const day = dayjs().format('YYYY-MM-DD');
        const totalday = await Deliivery.aggregate([
            {
                $match: {
                    status: "ได้รับสินค้าแล้ว",
                    partner_id: id,
                    updatedAt: {
                        $gte: new Date(day + "T00:00:00.000Z"),
                        $lt: new Date(day + "T23:59:59.999Z")
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalproduct" }
                }
            }
        ]);
        //ออเดอร์ประจำวัน
        const totalorderday = await Deliivery.countDocuments({
            status: "ได้รับสินค้าแล้ว",
            partner_id: id,
            updatedAt: {
                $gte: new Date(day + "T00:00:00.000Z"),
                $lt: new Date(day + "T23:59:59.999Z")
            }
        });
        // จำนวนสินค้าที่ฝากขายทั้งหมด
        const totalproduct = await Product.countDocuments({
            product_partner_id: id
        });

        //ยอดขายย้อนหลัง 12 เดือนแบ่งเป็นเดือน
        const startDate = dayjs().subtract(12, 'month').startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
        const endDate = dayjs().endOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";

        const totalmonth = await Deliivery.aggregate([
            {
                $match: {
                    status: "ได้รับสินค้าแล้ว",
                    partner_id: { $eq: id }, // ใส่เงื่อนไขเพิ่มเติมตามความเหมาะสม
                    updatedAt: {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate)
                    }
                  
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-01", date: "$updatedAt" }
                    },
                    total: { $sum: "$totalproduct" }
                }
            }
        ]);

        return res.status(200).send({ status: true, message: "dashboard" ,totalday: totalday[0] ? totalday[0].total : 0, totalorderday: totalorderday, totalproduct: totalproduct, totalmonth: totalmonth})


    }catch(err){
        return res.status(500).send({ status: false, message: err.message })
    
    }

}

// สรุปยอดรายรับ/รายจ่าย เก็บ report ประจำวัน / เดือน / ปี   
module.exports.reportprofitandloss = async (req, res) => {
    try{
        //รับ id day month year
        const id = req.body.id;
        if(id =="day")
        {
            
            //ดึงข้อมูลรายรับ มารวมเป็นรายวันในแต่ละวัน
            const income = await Deliivery.aggregate([
                {
                    $match: {
                        status: "ได้รับสินค้าแล้ว"
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%dT00:00:00.000Z", date: "$updatedAt" }
                        },
                        total: { $sum: "$totalproduct" }
                    }
                }
            ]);
            //ดึงข้อมูลรายจ่าย มารวมเป็นรายวันในแต่ละวัน
            const expenses = await Withdrawmoney.aggregate([
                {
                    $match: {
                        status: true
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%dT00:00:00.000Z", date: "$updatedAt" }
                        },
                        total: { $sum: "$money" }
                    }
                }
            ]);
            //นำข้อมูลมารวมกัน
            const data = [];
            income.map((item) => {
                const find = expenses.find((item2) => item2._id == item._id);
                if(find)
                {
                    data.push({
                        date: item._id,
                        income: item.total,
                        expenses: find.total
                    });
                }else{
                    data.push({
                        date: item._id,
                        income: item.total,
                        expenses: 0
                    });
                }
            });
            return res.status(200).send({ status: true, message: "report", data: data})
            
        }else if(id =="month")
        {
             //ดึงข้อมูลรายรับ มารวมเป็นในแต่ละเดือน
            const income = await Deliivery.aggregate([
                {
                    $match: {
                        status: "ได้รับสินค้าแล้ว"
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-01", date: "$updatedAt" }
                        },
                        total: { $sum: "$totalproduct" }
                    }
                }
            ]);
            //ดึงข้อมูลรายจ่าย มารวมเป็นในแต่ละเดือน
            const expenses = await Withdrawmoney.aggregate([
                {
                    $match: {
                        status: true
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-01", date: "$updatedAt" }
                        },
                        total: { $sum: "$money" }
                    }
                }
            ]);
            //นำข้อมูลมารวมกัน
            const data = [];
            income.map((item) => {
                const find = expenses.find((item2) => item2._id == item._id);
                if(find)
                {
                    data.push({
                        date: item._id,
                        income: item.total,
                        expenses: find.total
                    });
                }else{
                    data.push({
                        date: item._id,
                        income: item.total,
                        expenses: 0
                    });
                }
            });
            return res.status(200).send({ status: true, message: "report", data: data})


        }else if(id =="year")
        {
            //ดึงข้อมูลรายรับ มารวมเป็นในแต่ละปี
            const income = await Deliivery.aggregate([
                {
                    $match: {
                        status: "ได้รับสินค้าแล้ว"
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-01-01", date: "$updatedAt" }
                        },
                        total: { $sum: "$totalproduct" }
                    }
                }
            ]);
            //ดึงข้อมูลรายจ่าย มารวมเป็นในแต่ละปี
            const expenses = await Withdrawmoney.aggregate([
                {
                    $match: {
                        status: true
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-01-01", date: "$updatedAt" }
                        },
                        total: { $sum: "$money" }
                    }
                }
            ]);
            //นำข้อมูลมารวมกัน
            const data = [];
            income.map((item) => {
                const find = expenses.find((item2) => item2._id == item._id);
                if(find)
                {
                    data.push({
                        date: item._id,
                        income: item.total,
                        expenses: find.total
                    });
                }else{
                    data.push({
                        date: item._id,
                        income: item.total,
                        expenses: 0
                    });
                }
            });
            return res.status(200).send({ status: true, message: "report", data: data})


        }else{
            return res.status(400).send({ status: false, message: "id is required" })
        }
    }catch(err){
        return res.status(500).send({ status: false, message: err.message })
    }
}