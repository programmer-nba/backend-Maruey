const express = require('express');
const router = express.Router();
const userAuth = require('../../authentication/userAuth')
const Information = require("../../controllers/information/information.controller")

//เพิ่มข้อมูลพื้นฐาน
router.post('/',userAuth.admin,Information.addInformation);
//ดึงข้อมูลพื้นฐาน
router.get('/',userAuth.all,Information.getInformation);

//แก้ไขข้อมูลพื้นฐาน
router.put('/',userAuth.admin,Information.updateInformation);
//ลบข้อมูลพื้นฐาน
router.delete('/',userAuth.admin,Information.deleteInformation);
module.exports = router;