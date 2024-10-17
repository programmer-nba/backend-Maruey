const express = require('express');
const router = express.Router();
const report = require("../../controllers/report/report.controller")
const userAuth = require('../../authentication/userAuth')

router.get('/partner/:username', report.getShopOrderReports);

module.exports = router;