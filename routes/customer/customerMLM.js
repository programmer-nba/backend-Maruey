const express = require('express');
const router = express.Router();
const Customer = require("../../controllers/customer/customerMLM_controller")

router.get('/:id/address', Customer.getUserAddress);
router.get('/:id/ewallet', Customer.getUserEwalletTransfer);
router.get('/check-user/:id', Customer.checkIntroduceUser);

module.exports = router;