const express = require('express');
const router = express.Router();
const Customer = require("../../controllers/customer/customerMLM_controller")

router.get('/:id/address', Customer.getUserAddress);

module.exports = router;