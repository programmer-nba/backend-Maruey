const express = require('express');
const router = express.Router();
const delivery = require('../../controllers/order/delivery.controller');
const userAuth = require('../../authentication/userAuth')

//ดึงข้อมูลการจัดส่งทั้งหมด
router.get('/',userAuth.all,delivery.get);
//ดึงข้อมูลการจัดส่งตามไอดี
router.get('/byid/:id',userAuth.all,delivery.getbyid);
//ดึงข้อมูลการจัดส่งตามไอดีลูกค้า
router.get('/customer/:id',userAuth.all,delivery.getbycustomer);
//ดึงข้อมูลการจัด ของ maruey
router.get('/maruey/',userAuth.all,delivery.getbymaruey);
//ดึงข้อมูลการจัดส่งตามไอดีพาร์ทเนอร์
router.get('/partner/:id',userAuth.all,delivery.getbypartner);

//ดึงข่้อมูลทั้งหมด หน้า พาร์ทเนอร์ all
router.get('/partnerall/:id',userAuth.all,delivery.getbypartnerorder);

//ดึงข้อมูลที่มี partner_id ไม่เท่ากับ ว่าง
router.get('/bypartnerall/',userAuth.all,delivery.getbypartnerall);
//ดึงข้อมูลที่มี partner_name เท่ากับ บริษัท มารวยด้วยกัน จำกัด
router.get('/bypartnernamemaruey/',userAuth.all,delivery.getbymarueyall);
//จัดส่งสินค้าให้ลูกค้าแล้ว
router.put('/sendproduct/:id',userAuth.all,delivery.sendproduct);


//สินค้าโดนตีกลับ
router.put('/productreturn/:id',delivery.productreturn);
//ไรเดอร์มาส่งของแล้ว
router.put('/riderdelivery/:id',delivery.riderdelivery);

//ลูกค้ารับสินค้าแล้ว
router.put('/receiveproduct/:id',userAuth.all,delivery.getproduct);


module.exports = router;