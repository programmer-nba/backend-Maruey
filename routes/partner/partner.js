const express = require('express');
const router = express.Router();
const Partner = require("../../controllers/partner/partner.controller")
const userAuth = require('../../authentication/userAuth')

router.post('/', Partner.createPartner);
router.post('/shop-image', Partner.upload.single('file'), Partner.uploadPartnerImage);
router.get('/shop/shop-image/:shop_id', Partner.getPartnerImage);
router.get('/:id', Partner.getPartnerById);
router.get('/byusername/:username', Partner.getPartnerByUsername);
router.put('/:id', Partner.updatePartner);

router.get('/all/admin', Partner.getPartners);

//เพิ่มรูปภาพบัญชี
router.put('/addbankimage/:id',userAuth.adminandpartner,Partner.addimgbank);

//เพิ่มบัตรประชาชน
router.put('/addidcard/:id',userAuth.adminandpartner,Partner.addimgiden);

//เปิด -ปิด สถานะ Partner
router.put('/status/:id',userAuth.admin,Partner.status);

// ยอมรับ สัญญา Partner ,pdpa
router.put('/accept/:id',userAuth.adminandpartner,Partner.status_promiss);

module.exports = router;