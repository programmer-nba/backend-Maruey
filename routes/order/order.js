const express = require('express');
const router = express.Router();
const Order = require("../../controllers/order/order.controller")
const userAuth = require('../../authentication/userAuth')

//สร้างออเดอร์
router.post('/',userAuth.customer,Order.add);

//ดึงออเดอร์ทั้งหมด
router.get('/',userAuth.all,Order.get);
//ดึงออเดอร์ตามไอดี
router.get('/byid/:id',userAuth.customer,Order.getbyid);

router.get('/test/',Order.test); 
module.exports = router;