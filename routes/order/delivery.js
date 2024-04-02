const express = require('express');
const router = express.Router();
const delivery = require('../../controllers/order/delivery.controller');
const userAuth = require('../../authentication/userAuth')

//ดึงข้อมูลการจัดส่งทั้งหมด
router.get('/',userAuth.customer,delivery.get);
//ดึงข้อมูลการจัดส่งตามไอดี
router.get('/:id',userAuth.customer,delivery.getbyid);
//ดึงข้อมูลการจัดส่งตามไอดีลูกค้า
router.get('/customer/:id',userAuth.customer,delivery.getbycustomer);

module.exports = router;