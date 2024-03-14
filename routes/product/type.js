const express = require('express');
const router = express.Router();
const type = require("../../controllers/product/type.controller")
const userAuth = require('../../authentication/userAuth')


//เพิ่มหมวดหมู่สินค้าย่อย
router.post('/',userAuth.admin,type.add);

//ดึงข้อมูลหมวดหมู่สินค้าย่อยทั้งหมด
router.get('/',type.getall);

//ดึงข้อมูลหมวดหมู่สินค้าย่อยตามไอดี
router.get('/byid/:id',type.getbyid);

//แก้ไขข้อมูลหมวดหมู่สินค้าย่อย
router.put('/:id',userAuth.admin,type.edit);

//ลบข้อมูลหมวดหมู่สินค้าย่อย
router.delete('/:id',userAuth.admin,type.delete);

module.exports = router;