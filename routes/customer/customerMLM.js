const express = require('express');
const router = express.Router();
const Customer = require("../../controllers/customer/customerMLM_controller")

router.get('/:id/address', Customer.getUserAddress);
router.get('/:id/ewallet', Customer.getUserEwalletTransfer);
router.get('/:username/ewallets', Customer.getUserEwallet);
router.get('/check-user/:id', Customer.checkIntroduceUser);
router.get('/:id/delivery', Customer.getUserAddressDelivery);
router.post('/delivery', Customer.upsertUserAddressDelivery);
router.get('/:id/me', Customer.getUserData);
router.get('/member-name/:username', Customer.getMemberName);
router.get('/member/:username', Customer.getMemberData);
router.get('/upline/:username', Customer.getUplineData);
router.get('/downline/:username', Customer.getDownlineData);

module.exports = router;