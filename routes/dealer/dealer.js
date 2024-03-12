const express = require('express');
const router = express.Router();
const Dealer = require("../../controllers/dealer/dealer.controller")
const userAuth = require('../../authentication/userAuth')

//สร้างไอดี dealer (คู่ค้า)
router.post('/',userAuth.adminanddealer,Dealer.add);

//ดึงข้อมูลทั้งหมด
router.get('/',userAuth.adminanddealer,Dealer.getall);

//ดึงข้อมูล by id
router.get('/byid/:id',userAuth.adminanddealer,Dealer.getbyid);

//แก้ไขข้อมูล dealer
router.put('/:id',userAuth.adminanddealer,Dealer.edit);

//ลบข้อมูล dealer
router.delete('/:id',userAuth.admin,Dealer.delete);



//เพิ่มรูปภาพบัญชี
router.put('/addbankimage/:id',userAuth.adminanddealer,Dealer.addimgbank);

//เพิ่มบัตรประชาชน
router.put('/addidcard/:id',userAuth.adminanddealer,Dealer.addimgiden);


//เปิด -ปิด สถานะ dealer
router.put('/status/:id',userAuth.admin,Dealer.status);

// ยอมรับ สัญญา dealer ,pdpa
router.put('/accept/:id',userAuth.dealer,Dealer.status_promiss);

module.exports = router;