const express = require('express');
const router = express.Router();
const Order = require("../../controllers/order/orderMLM_controller")

router.post('/:id/orders', Order.createOrder)
router.get('/:id/orders', Order.getUserOrders)
router.get('/orders/:id', Order.getOrder)
router.get('/order-status', Order.getOrderStatuses)

router.get('/shipping/costs', Order.getShippingCosts)
router.get('/shipping/types', Order.getShippingTypes)

router.get('/shipping/far/:zipcode', Order.getFarLocation)

module.exports = router;