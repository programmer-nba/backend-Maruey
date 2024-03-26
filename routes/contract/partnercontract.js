const express = require('express');
const router = express.Router();
const Partnercontract = require("../../controllers/contract/partnercontract.controller")
const userAuth = require('../../authentication/userAuth')
//สร้างสัญญา dealer
router.post('/',userAuth.admin,Partnercontract.addPartnercontract);

//ดึงข้อมูลสัญญา dealer
router.get('/',userAuth.adminandpartner,Partnercontract.getallPartnercontract);

//แก้ไขข้อมูลสัญญา dealer
router.put('/:id',userAuth.adminandpartner,Partnercontract.editPartnercontract);

//ลบข้อมูลสัญญา dealer
router.delete('/:id',userAuth.adminandpartner,Partnercontract.deletePartnercontract);

//เพิ่มlogo
router.put('/logo/:id',userAuth.adminandpartner,Partnercontract.addimglogo);

module.exports = router;