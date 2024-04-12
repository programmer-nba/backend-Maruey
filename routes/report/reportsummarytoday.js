const express = require('express');
const router = express.Router();
const reportsummarytoday = require("../../controllers/report/reportsummarytoday.controller")
const userAuth = require('../../authentication/userAuth')


//เพิ่มข้อมูลสรุปเงินคงเหลือในระบบ
router.post('/',userAuth.all,reportsummarytoday.add);
//ดึงทั้งหมด
router.get('/',userAuth.admin,reportsummarytoday.getAll);
//ดึุง by id
router.get('/byid/:id',userAuth.admin,reportsummarytoday.getByID);
//แก้ไข
router.put('/:id',userAuth.admin,reportsummarytoday.edit);
//ลบ
router.delete('/:id',userAuth.admin,reportsummarytoday.delete);






module.exports = router;