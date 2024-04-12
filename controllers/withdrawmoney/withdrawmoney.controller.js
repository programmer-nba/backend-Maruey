const {Withdrawmoney} = require("../../models/withdrawmoney/withdrawmoney.schema");
const {Customer} = require("../../models/customer/customer.schema");    
const {Partner} = require("../../models/partner/partner.schema");

//เพิ่มข้อมูลถอนเงิน
module.exports.add = async (req, res) => {
    try{
        if(req.body.customer_id !== undefined || req.body.customer_id !=='') 
        {
            const customer = await Customer.findById(req.body.customer_id);
            if(!customer)
            {
                return res.status(400).send({ status: false, message: "ไม่พบข้อมูล customer_id" })
            }
            //เช็คว่ามีเงินพอไหม
            if(customer.money < req.body.money)
            {
                return res.status(400).send({ status: false, message: "เงินไม่พอ" })
            }
            //ภ้าพอก็ให้หักเงิน
            const customermoney = await Customer.findByIdAndUpdate(req.body.customer_id,{$inc:{money:-req.body.money}},{new:true});
        }else if(req.body.partner_id !== undefined || req.body.partner_id !=='')
        {
            const partner = await Partner.findById(req.body.partner_id);
            if(!partner)
            {
                return res.status(400).send({ status: false, message: "ไม่พบข้อมูล partner_id" })
            }
            //เช็คว่ามีเงินพอไหม
            if(partner?.income < req.body.money)
            {
                return res.status(400).send({ status: false, message: "เงินไม่พอ" })
            }
            //ภ้าพอก็ให้หักเงิน
            const partnermoney = await Partner.findByIdAndUpdate(req.body.partner_id,{$inc:{income:-req.body.money}},{new:true})
            
        }else{
            return res.status(400).send({ status: false, message: "กรุณากรอก customer_id หรือ partner_id" })
        }

        const data = new Withdrawmoney({
            ...req.body,
            type:"ถอนเงิน"
        });
        const add = await data.save();
        return res.status(200).send({status:true,data:add});
    }catch(err){
        return res.status(500).send({ status: false, message: err.message })
    }
}

//ดึงข้อมูลถอนเงินทั้งหมด
module.exports.getAll = async (req, res) => {
    try {
        const withdrawmoney = await Withdrawmoney.find();
        return res.status(200).send({status:true,data:withdrawmoney});
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
//ดึงข้อมูล by id ถอนเงิน
module.exports.getByID = async (req, res) => {
    try {
        const withdrawmoney = await Withdrawmoney.findById(req.params.id);
        return res.status(200).send({status:true,data:withdrawmoney});
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

//ดึงข้อมูล by customer_id ถอนเงิน
module.exports.getByCustomerID = async (req, res) => {
    try{
        const withdrawmoney = await Withdrawmoney.find({customer_id:req.params.customer_id});
        return res.status(200).send({status:true,data:withdrawmoney});

    }catch(err){
        return res.status(500).send({ status: false, message: err.message })
    }
}


//ดึงข้อมูล by partner_id ถอนเงิน
module.exports.getByPartnerID = async (req, res) => {
    try{
        const withdrawmoney = await Withdrawmoney.find({partner_id:req.params.partner_id});
        return res.status(200).send({status:true,data:withdrawmoney});

    }catch(err){
        return res.status(500).send({ status: false, message: err.message })
    }
}

//แก้ไขข้อมูลถอนเงิน
module.exports.edit = async (req, res) => {
    try {
        const withdrawmoney = await Withdrawmoney.findByIdAndUpdate(req.params.id,req.body,{new:true});
        return res.status(200).send({status:true,data:withdrawmoney});
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//ลบข้อมูลถอนเงิน
module.exports.delete = async (req, res) => {
    try {
        const withdrawmoney = await Withdrawmoney.findByIdAndDelete(req.params.id);
        return res.status(200).send({status:true,data:withdrawmoney});
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



//จ่ายเงินแล้ว
module.exports.success = async (req, res) => {
    try {

        const withdrawmoney = await Withdrawmoney.findByIdAndUpdate(req.params.id,{admin_id:req.body.admin_id,status:true,$push:{statusdetail:{status:"จ่ายเงินสำเร็จ"}}},{new:true});
        return res.status(200).send({status:true,data:withdrawmoney});
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}