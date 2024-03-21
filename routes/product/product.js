const express = require('express');
const router = express.Router();
const product = require("../../controllers/product/product.controller")
const userAuth = require('../../authentication/userAuth')


//เพิ่มข้อมูลสินค้า
router.post('/',userAuth.adminanddealer,product.add);

//ดึงข้อมูลสินค้าทั้งหมด 
router.get('/',product.getall);
//ดึงข้อมูลสินค้าตามไอดี
router.get('/byid/:id',product.getbyid);
//ดึงข้อมูลสินค้าตาม dealer id
router.get('/bydealer/:id',product.getbydealer);

//ค้นหาสินค้าตามที่กรอกเข้ามา
router.get('/search/:name',product.search);
//แก้ไขข้อมูลสินค้า
router.put('/:id',userAuth.adminanddealer,product.edit);
//ลบข้อมูลสินค้า
router.delete('/:id',userAuth.adminanddealer,product.delete);
//เปิด-ปิดขายสินค้า
router.put('/status/:id',userAuth.adminanddealer,product.status);

//รูปสินค้า
router.put('/image/:id',userAuth.adminanddealer,product.addimgproduct);

module.exports = router;