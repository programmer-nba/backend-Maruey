const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {Type} = require("../../models/product/type.schema");

//เพิ่มหมวดหมู่สินค้าย่อย
module.exports.add = async (req, res) => {
    try{
        const add = new Type({ type_name:req.body.type_name});
        const save = await add.save();
        return res.status(200).send({ message: "เพิ่มหมวดหมู่สินค้าย่อยสำเร็จ",data:save , status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }
}


//ดึงข้อมูลทั้งหมด
module.exports.getall = async (req, res) => {
    try{
        const get = await Type.find();
        return res.status(200).send({ message: "ดึงข้อมูลหมวดหมู่สินค้าย่อยสำเร็จ", data: get, status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }
}

//ดึงข้อมูลหมวดหมู่สินค้าย่อยตาม id
module.exports.getbyid = async (req, res) => {
    try{
        const get = await Type.findById(req.params.id);
        if(!get) return res.status(400).send({ message: "ไม่พบข้อมูลหมวดหมู่สินค้าย่อย", status: false });
        return res.status(200).send({ message: "ดึงข้อมูลหมวดหมู่สินค้าย่อยสำเร็จ", data: get, status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }
}
//แก้ไขข้อมูลหมวดหมู่สินค้าย่อย
module.exports.edit = async (req, res) => {
    try{
        const edit = await Type.findByIdAndUpdate(req.params.id, { type_name:req.body.type_name }, { new: true });
        return res.status(200).send({ message: "แก้ไขข้อมูลหมวดหมู่สินค้าย่อยสำเร็จ",data:edit , status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }
}

//ลบข้อมูลหมวดหมู่สินค้าย่อย
module.exports.delete = async (req, res) => {
    try{
        const del = await Type.findByIdAndDelete(req.params.id);
        return res.status(200).send({ message: "ลบข้อมูลหมวดหมู่สินค้าย่อยสำเร็จ", status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }
}

