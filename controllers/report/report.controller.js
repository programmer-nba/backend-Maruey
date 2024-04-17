//dayjs
const dayjs = require('dayjs');
//รายรับ
const {Deliivery} = require('../../models/order/delivery.schema');
//รายจ่าย
const {Withdrawmoney} = require('../../models/withdrawmoney/withdrawmoney.schema');



// dashboard พาร์ทเนอร์
module.exports.dashboardpartner = async (req, res) => {
    try{
        //ยอดขายประจำวัน

        //ออเดอร์ประจำวัน

        // สินค้าที่ฝากขายทั้งหมด
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