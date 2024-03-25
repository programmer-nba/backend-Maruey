const express = require('express');
const router = express.Router();
const Percentprofit = require("../../controllers/percentprofit/percentprofit.controller");
const userAuth = require('../../authentication/userAuth');
//เพิ่มข้อมูลเปอร์เซ้นต์กำไร
router.post('/',userAuth.admin,Percentprofit.add);
//ดึงข้อมูลเปอร์เซ็นต์กำไร
router.get('/',userAuth.admin,Percentprofit.get);
//แก้ไขข้อมูลเปอร์เซ็นต์กำไร
router.put('/:id',userAuth.admin,Percentprofit.edit);
//แก้ไขข้อมูลเปอร์เซ็นต์กำไร ของ partner  
router.put('/editpercentpartner/:id',userAuth.admin,Percentprofit.editpercentpartner);
//แก้ไขข้อมูลเปอร์เซ็นต์กำไร ของ สินค้ามารวย
router.put('/editpercentmaruey/:id',userAuth.admin,Percentprofit.editpercentmaruey);
//แก้ไขข้อมูลเปอร์เซ็นต์กำไร ของ แชร์ลิงค์
router.put('/editsharelink/:id',userAuth.admin,Percentprofit.editsharelink);


//ลบข้อมูลเปอร์เซ็นต์กำไร
router.delete('/:id',userAuth.admin,Percentprofit.delete);


module.exports = router;