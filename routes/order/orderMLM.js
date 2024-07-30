const express = require('express');
const router = express.Router();
const Order = require("../../controllers/order/orderMLM_controller")

router.post('/:id/orders', Order.createOrder)
router.get('/:id/orders', Order.getUserOrders)
router.get('/order-status', Order.getOrderStatuses)

module.exports = router;