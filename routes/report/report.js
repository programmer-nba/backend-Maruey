const express = require('express');
const router = express.Router();
const report = require("../../controllers/report/report.controller")
const userAuth = require('../../authentication/userAuth')

//dashboard admin
router.get('/dashboardadmin/',userAuth.admin,report.dashboardadmin);

//dashboard partner
router.get('/dashboardpartner/:id',userAuth.partner,report.dashboardpartner);

//สรุปยอดรายรับ/รายจ่าย เก็บ report ประจำวัน / เดือน / ปี
router.post('/reportprofitandloss',userAuth.admin,report.reportprofitandloss);

//สรุปยอดขายสินค้าของพาร์ทเนอร์ แต่ละไอดี ประจำวัน / เดือน / ปี
router.post('/reportpartner',userAuth.admin,report.reportpricepartner);

//สรุปยอดขายสินค้าของพาร์ทเนอร์ ของตัวเอง  ประจำวัน / เดือน / ปี
router.post('/reportpartnerbyid/',userAuth.partner,report.reportpricepartnerbyid);
module.exports = router;