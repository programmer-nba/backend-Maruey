const express = require('express');
const router = express.Router();
const Order = require("../../controllers/order/order.controller")
const userAuth = require('../../authentication/userAuth')

//สร้างออเดอร์
router.post('/',userAuth.customer,Order.add);


module.exports = router;