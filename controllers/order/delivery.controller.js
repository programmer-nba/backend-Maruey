const {Deliivery} = require("../../models/order/delivery.schema");

module.exports.get = async (req, res) => {
    try{
        const delivery = await Deliivery.find()
        return res.status(200).send({ status: true, data: delivery })
    }catch(err){
        return res.status(200).send({ status: false, message: err.message })
    }
}

module.exports.getbyid = async (req, res) => {
    try{
        const delivery = await Deliivery.findOne({ _id: req.params.id })
        return res.status(200).send({ status: true, data: delivery })
    }
    catch(err){
        return res.status(200).send({ status: false, message: err.message })
    }
}

module.exports.getbycustomer = async (req, res) => {
    try{
        const delivery = await Deliivery.find({ customer_id: req.params.id})
        return res.status(200).send({ status: true, data: delivery })
    }catch(err){
        return res.status(200).send({ status: false, message: err.message })
    }
}