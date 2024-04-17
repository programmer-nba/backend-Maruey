const express = require('express');
const router = express.Router();
const report = require("../../controllers/report/report.controller")
const userAuth = require('../../authentication/userAuth')

//สรุปยอดรายรับ/รายจ่าย เก็บ report ประจำวัน / เดือน / ปี
router.post('/reportprofitandloss',userAuth.admin,report.reportprofitandloss);


module.exports = router;