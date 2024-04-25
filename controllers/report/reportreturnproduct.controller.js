const {Deliivery} = require("../../models/order/delivery.schema");
// รายงานสินค้าตีกลับ ทั้งหมด
module.exports.reportReturnProductAll = async (req, res) => {
    try{
        const deliivery = await Deliivery.find({status:"ตีกลับสินค้า"}).populate('order_id').populate('customer_id').populate('shareincome_id')
        return res.status(200).send({ status: true, data: deliivery })
    }catch(err){
        return res.status(500).send({ status: false, message: err.message })
    }
}

// รายงานสินค้าตีกลับ  by partner
module.exports.reportReturnProductByPartner = async (req, res) => {
    try{
        const deliivery = await Deliivery.find({status:"ตีกลับสินค้า",partner_id:req.params.id}).populate('order_id').populate('customer_id').populate('shareincome_id')
        return res.status(200).send({ status: true, data: deliivery })
    }catch(err){
        return res.status(500).send({ status: false, message: err.message })
    }
}