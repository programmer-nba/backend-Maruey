const express = require('express');
const router = express.Router();
const reportreturnproduct = require("../../controllers/report/reportreturnproduct.controller")
const userAuth = require('../../authentication/userAuth')

// รายงานสินค้าตีกลับ ทั้งหมด
router.get('/',userAuth.admin,reportreturnproduct.reportReturnProductAll);

// รายงานสินค้าตีกลับ  by partner
router.get('/bypartner/:id',userAuth.partner,reportreturnproduct.reportReturnProductByPartner);



module.exports = router;