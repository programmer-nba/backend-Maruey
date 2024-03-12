const express = require('express');
const router = express.Router();
const Partner = require("../../controllers/partner/partner.controller")
const userAuth = require('../../authentication/userAuth')

//สร้างไอดี Partner
router.post('/',userAuth.adminandpartner,Partner.add);

//ดึงข้อมูลทั้งหมด
router.get('/',userAuth.admin,Partner.getall);

//ดึงข้อมูล by id
router.get('/byid/:id',userAuth.adminandpartner,Partner.getbyid);

//แก้ไขข้อมูล Partner
router.put('/:id',userAuth.adminandpartner,Partner.edit);

//ลบข้อมูล Partner
router.delete('/:id',userAuth.admin,Partner.delete);



//เพิ่มรูปภาพบัญชี
router.put('/addbankimage/:id',userAuth.adminandpartner,Partner.addimgbank);

//เพิ่มบัตรประชาชน
router.put('/addidcard/:id',userAuth.adminandpartner,Partner.addimgiden);


//เปิด -ปิด สถานะ Partner
router.put('/status/:id',userAuth.admin,Partner.status);

// ยอมรับ สัญญา Partner ,pdpa
router.put('/accept/:id',userAuth.partner,Partner.status_promiss);

module.exports = router;