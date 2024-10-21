const express = require('express');
const router = express.Router();
const Order = require("../../controllers/order/order.controller")
//const userAuth = require('../../authentication/userAuth')

//สร้างออเดอร์
router.post('/partner/create', Order.createOrderPartner);
router.put('/partner/update/:id', Order.updateOrderPartner);

//ดึงออเดอร์ทั้งหมดของลุกค้า
router.post('/partner/all', Order.getUserOrdersPartner); // username

// ดึคงออเดอร์ทั้งหมดของร้านค้า
router.post('/partner-shop/all', Order.getShopOrdersPartner); // username

//ดึงออเดอร์ตามไอดี
router.get('/partner/:id', Order.getUserOrderPartner);

router.get('/all/partner', Order.getOrders);

//router.get('/test/',Order.test); 

module.exports = router;