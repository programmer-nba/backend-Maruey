const express = require('express');
const router = express.Router();
const Dealercontract = require("../../controllers/contract/dealercontract.controller")
const userAuth = require('../../authentication/userAuth')
//สร้างสัญญา dealer
router.post('/',userAuth.admin,Dealercontract.addDealercontract);

//ดึงข้อมูลสัญญา dealer
router.get('/',userAuth.adminanddealer,Dealercontract.getallDealercontract);

//แก้ไขข้อมูลสัญญา dealer
router.put('/:id',userAuth.adminanddealer,Dealercontract.editDealercontract);

//ลบข้อมูลสัญญา dealer
router.delete('/:id',userAuth.adminanddealer,Dealercontract.deleteDealercontract);

//เพิ่มlogo
router.put('/logo/:id',userAuth.adminanddealer,Dealercontract.addimglogo);

module.exports = router;