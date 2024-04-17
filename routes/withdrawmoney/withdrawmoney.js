const express = require('express');
const router = express.Router();
const Withdrawmoney = require("../../controllers/withdrawmoney/withdrawmoney.controller")
const userAuth = require('../../authentication/userAuth')


//เพิ่มข้อมูลการถอนเงิน
router.post('/',userAuth.all,Withdrawmoney.add);
//ดึงทั้งหมด
router.get('/',userAuth.all,Withdrawmoney.getAll);
//ดึง by id
router.get('/byid/:id',userAuth.all,Withdrawmoney.getByID);

//ดึง by customer_id
router.get('/bycustomer/:customer_id',userAuth.all,Withdrawmoney.getByCustomerID);

//ดึง by partner_id
router.get('/bypartner/:partner_id',userAuth.all,Withdrawmoney.getByPartnerID);

//ดึง by status false
router.get('/bystatusfalse',userAuth.all,Withdrawmoney.getByStatusFalse);


//ดึงข้อมูลทั้งหมดการถอนเฉพาะของ partner
router.get('/partner',userAuth.all,Withdrawmoney.getAllPartner);

//ดึงข้้อมูลเฉพาะ status เป็น false ของ partner
router.get('/partnerbystatusfalse',userAuth.all,Withdrawmoney.getByStatusFalsePartner);

//แก้ไข
router.put('/update/:id',userAuth.admin,Withdrawmoney.edit);
//ลบ
router.delete('/:id',userAuth.admin,Withdrawmoney.delete);

//จ่ายเงินแล้ว
router.put('/success/:id',userAuth.admin,Withdrawmoney.success);

//จ่ายเงินตามรายการทีั่เลือก
router.put('/successmany/',userAuth.admin,Withdrawmoney.successMany);

module.exports = router;