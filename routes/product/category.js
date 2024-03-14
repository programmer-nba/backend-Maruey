const express = require('express');
const router = express.Router();
const category = require("../../controllers/product/category.controller")
const userAuth = require('../../authentication/userAuth')

//เพิ่มหมวดหมู่สินค้า
router.post('/',userAuth.admin,category.add);

//ดึงข้อมูลหมวดหมู่สินค้าทั้งหมด
router.get('/',category.getall);

//ดึงข้อมูลหมวดหมู่สินค้าตามไอดี
router.get('/byid/:id',category.getbyid);

//แก้ไขข้อมูลหมวดหมู่สินค้า
router.put('/:id',userAuth.admin,category.edit);

//ลบข้อมูลหมวดหมู่สินค้า
router.delete('/:id',userAuth.admin,category.delete);



module.exports = router;