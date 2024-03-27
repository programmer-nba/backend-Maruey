const express = require('express');
const router = express.Router();
const Requestproduct= require('../../controllers/product/requestproduct.controller');
const userAuth = require('../../authentication/userAuth');

//เพิ่มคำร้องขอฝากขายสินค้า
router.post('/', userAuth.partner, Requestproduct.add);
//ดึงข้อมูลคำร้องขอฝากขายสินค้าทั้งหมด
router.get('/',userAuth.adminandpartner ,Requestproduct.getAll);
//ดึงข้อมูลคำร้องขอฝากขายสินค้า by id
router.get('/byid/:id',userAuth.adminandpartner , Requestproduct.getById);
//ดึงข้อมูลคำร้องขอฝากขายสินค้า by partner_id
router.get('/bypartner/:id', userAuth.partner,Requestproduct.getByPartnerId);

//อัพเดทข้อมูลคำร้องขอฝากขายสินค้า
router.put('/:id',userAuth.adminandpartner, Requestproduct.update);
//ลบข้อมูลคำร้องขอฝากขายสินค้า
router.delete('/:id',userAuth.adminandpartner ,Requestproduct.delete);
//อนุมัติคำร้องขอฝากขายสินค้า
router.put('/approve/:id',userAuth.admin, Requestproduct.approve);
//ไม่อนุมัติคำร้องขอฝากขายสินค้า
router.put('/disapprove/:id', userAuth.admin,Requestproduct.disapprove);
//เพิ่มรูปภาพสินค้า
router.put('/image/:id', userAuth.adminandpartner,Requestproduct.addimgproduct);


module.exports = router;