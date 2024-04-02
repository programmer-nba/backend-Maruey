const {Information} = require('../../models/information/information.schema');

module.exports.addInformation = async (req, res) => {
    try {
        const information = new Information({
            address:req.body.address    
        });
        const add = await information.save();
        return res.status(201).send({ status:true,message: "บันทึกข้อมูลสำเร็จ",data:add });
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }
}

module.exports.getInformation = async (req, res) => {

    try {
        const information = await Information.findOne();
        return res.status(200).send({ status:true,message: "ดึงข้อมูลสำเร็จ",data:information });
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }
}

module.exports.updateInformation = async (req, res) => {
    try {
        const information = await Information.findOne();
        information.address = req.body.address;
        const update = await information.save();
        return res.status(200).send({ status:true,message: "แก้ไขข้อมูลสำเร็จ",data:update });
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }
}

module.exports.deleteInformation = async (req, res) => {
    try {
        const information = await Information.findOne();
        const del = await information.remove();
        return res.status(200).send({ status:true,message: "ลบข้อมูลสำเร็จ",data:del });
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }
}