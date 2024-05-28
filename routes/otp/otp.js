const express = require('express');
const router = express.Router();
const Otp = require("../../controllers/otp/otp.controller")

//ส่ง OTP
router.post('/sendotp',Otp.sendotp);
// ยืนยัน OTP
router.post('/verifyotp',Otp.verifyotp);

module.exports = router;