const express = require('express');
const router = express.Router();
const product = require("../../controllers/product/product.controller")
const userAuth = require('../../authentication/userAuth')


//เพิ่มข้อมูลสินค้า
router.post('/',userAuth.adminandpartner,product.add);

//ดึงข้อมูลสินค้าทั้งหมด 
router.get('/',product.getall);
//ดึงข้อมูลสินค้าตามไอดี
router.get('/byid/:id',product.getbyid);
//ดึงข้อมูลสินค้าตาม dealer id
router.get('/bypartner/:id',product.getbypartner);

//ค้นหาสินค้าตามที่กรอกเข้ามา
router.get('/search/:name',product.search);

//ดึงข้อมูลสินค้าแนะนำ
router.get('/recommend/:id',product.getbycategory);

//แก้ไขข้อมูลสินค้า
router.put('/:id',userAuth.adminandpartner,product.edit);
//ลบข้อมูลสินค้า
router.delete('/:id',userAuth.adminandpartner,product.delete);
//เปิด-ปิดขายสินค้า
router.put('/status/:id',userAuth.adminandpartner,product.status);

//รูปสินค้า
router.put('/image/:id',userAuth.adminandpartner,product.addimgproduct);

module.exports = router;