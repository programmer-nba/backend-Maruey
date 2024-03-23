const express = require('express');
const router = express.Router();
const userAuth = require('../../authentication/userAuth')
const Customer = require("../../controllers/customer/customer.controller")

//สมัครลูกค้า
router.post('/',Customer.register);


//ดึงข้อมูลลูกค้าทั้งหมด
router.get('/',userAuth.admin,Customer.getall);
//ดึงข้อมูล by id
router.get('/byid/:id',userAuth.all,Customer.getbyid);

//แก้ไขข้อมูลลูกค้า
router.put('/:id',userAuth.all,Customer.edit);

//เพิ่มข้อมูลเลขภาพธนาคาร
router.put('/bank/:id',userAuth.all,Customer.addimgbank);

//ยอมรับ pdpa
router.put('/pdpa/:id',userAuth.all,Customer.pdpa);

module.exports = router;