const express = require('express');
const router = express.Router();
const Shareincome = require("../../controllers/shareincome/shareincome.controller")
const userAuth = require('../../authentication/userAuth')
//ดึงข้อมูลรายได้ทั้งหมด
router.get('/',userAuth.all,Shareincome.getShareincome);


module.exports = router;