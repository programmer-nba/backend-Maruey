const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {Category} = require("../../models/product/category.schema");

//เพิ่มหมวดหมู่สินค้า
module.exports.add = async (req, res) => {
    try{
        const category = await Category.findOne({ category_name: req.body.category_name });
        if(category) return res.status(409).send({ message: "มีหมวดหมู่สินค้านี้อยู่แล้ว", status: false });
        const add = new Category({ category_name:req.body.category_name});
        const save = await add.save();
        return res.status(200).send({ message: "เพิ่มหมวดหมู่สินค้าสำเร็จ",data:save , status: true });
    }catch(err){
       return res.status(500).send({ message: err.message, status: false });
    }
}
//ดึงข้อมูลทั้งหมด
module.exports.getall = async (req, res) => {
    try{
        const get = await Category.find();
        return res.status(200).send({ message: "ดึงข้อมูลหมวดหมู่สินค้าสำเร็จ", data: get, status: true });
    }catch(err){
       return res.status(500).send({ message: err.message, status: false });
    }
}

//ดึงข้อมูลหมวดหมู่สินค้าตาม id
module.exports.getbyid = async (req, res) => {
    try{
        const get = await Category.findOne({ _id: req.params.id });
        if(!get) return res.status(400).send({ message: "ไม่พบข้อมูลหมวดหมู่สินค้า", status: false });
        return res.status(200).send({ message: "ดึงข้อมูลหมวดหมู่สินค้าสำเร็จ", data: get, status: true });
    }catch(err){
       return res.status(500).send({ message: err.message, status: false });
    }
}
//แก้ไขข้อมูลหมวดหมู่สินค้า
module.exports.edit = async (req, res) => {
    try{
        const category = await Category.findById(req.params.id);
        if(!category) 
        {
            return res.status(409).send({ message: "ไม่พบข้อมูลหมวดหมู่สินค้า", status: false });
        }
       
        if(category.category_name != req.body.category_name) 
        {
            const check = await Category.findOne({ category_name: req.body.category_name });
            if(check)
            {
                return res.status(400).send({ message: "มีหมวดหมู่สินค้านี้อยู่แล้ว", status: false });
            }
           
        }
        const edit = await Category.findByIdAndUpdate(req.params.id, { category_name:req.body.category_name },{ new: true });
        return res.status(200).send({ message: "แก้ไขข้อมูลหมวดหมู่สินค้าสำเร็จ",data:edit , status: true });
    }catch(err){
       return res.status(500).send({ message: err.message, status: false });
    }
}
//ลบข้อมูลหมวดหมู่สินค้า
module.exports.delete = async (req, res) => {
    try{
        const del = await Category.findByIdAndDelete(req.params.id);
        return res.status(200).send({ message: "ลบข้อมูลหมวดหมู่สินค้าสำเร็จ", status: true });
    }catch(err){
       return res.status(500).send({ message: err.message, status: false });
    }
}



