const express = require('express');
const router = express.Router();
const product = require("../../controllers/product/product.controller")
const userAuth = require('../../authentication/userAuth')


//เพิ่มข้อมูลสินค้า
router.post('/',userAuth.admin,product.add);

//ดึงข้อมูลสินค้าทั้งหมด 
router.get('/',product.getall);
//ดึงข้อมูลสินค้าตามไอดี
router.get('/byid/:id',product.getbyid);
//แก้ไขข้อมูลสินค้า
router.put('/:id',userAuth.admin,product.edit);
//ลบข้อมูลสินค้า
router.delete('/:id',userAuth.admin,product.delete);
//เปิด-ปิดขายสินค้า
router.put('/status/:id',userAuth.admin,product.status);

//รูปสินค้า
router.put('/image/:id',userAuth.admin,product.addimgproduct);

module.exports = router;