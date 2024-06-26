const {Reportsummarytoday} = require("../../models/report/reportsummarytoday.schema");
const {Customer} = require("../../models/customer/customer.schema");
const {Partner} = require("../../models/partner/partner.schema");
//ทำสรุปข้อมูลสรุปเงินคงเหลือในระบบ
module.exports.add = async (req, res) => {
    try{
        const date = Date.now();
        let moneycustomer = 0;
        //ดึงข้อมูลลูกค้าทั้งหมด
        const customer = await Customer.find();
        customer.map((item)=>{
            moneycustomer += item.money
        }) 

        let moneypartner = 0;
        //ดึงข้อมูล partner ทั้งหมด
        const partner = await Partner.find();
        partner.map((item)=>{
            moneypartner += item.income
        });

        const money = moneycustomer + moneypartner;

        const data = new Reportsummarytoday({
            date:date,
            partner:moneypartner,
            customer:moneycustomer,
            money:money
        });
        const add = await data.save();
        return res.status(200).send({status:true,data:add});
    }catch(err){
        return res.status(500).send({ status: false, message: err.message })
    }
}

//ดึงข้อมูลสรุปเงินคงเหลือในระบบ
module.exports.getAll = async (req, res) => {
    try {
        const reportsummarytoday = await Reportsummarytoday.find();
        return res.status(200).send({status:true,data:reportsummarytoday});
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//ดึงข้อมูล by id สรุปเงินคงเหลือในระบบ
module.exports.getByID = async (req, res) => {
    try {
        const reportsummarytoday = await Reportsummarytoday.findById(req.params.id);
        return res.status(200).send({status:true,data:reportsummarytoday});
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}
//แก้ไขข้อมูลสรุปเงินคงเหลือในระบบ
module.exports.edit = async (req, res) => {
    try {
        const reportsummarytoday = await Reportsummarytoday.findByIdAndUpdate(req.params.id,req.body,{new:true});
        if(!reportsummarytoday) return res.status(404).send({status:false,message:"Reportsummarytoday not found"});
        return res.status(200).send({status:true,data:reportsummarytoday});
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//ลบข้อมูลสรุปเงินคงเหลือในระบบ
module.exports.delete = async (req, res) => {
    try {
        const reportsummarytoday = await Reportsummarytoday.findByIdAndDelete(req.params.id);
        if(!reportsummarytoday) return res.status(404).send({status:false,message:"Reportsummarytoday not found"});
        return res.status(200).send({status:true,data:reportsummarytoday});
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}