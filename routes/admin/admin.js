const express = require('express');
const router = express.Router();
const Admin = require("../../controllers/admin/admin.controller")
const userAuth = require('../../authentication/userAuth')



//สร้างรหัส admin
router.post('/',userAuth.admin,Admin.add)

//ดึงข้อมูลทั้งหมด
router.get('/',userAuth.admin,Admin.getall)

//ดึงข้อมูล by id
router.get('/byid/:id',userAuth.admin,Admin.getbyid)

// แก้ไขข้อมูล user 
router.put('/:id',userAuth.admin,Admin.edit)

// ลบข้อมูล user
router.delete('/:id',userAuth.admin,Admin.delete)

module.exports = router;