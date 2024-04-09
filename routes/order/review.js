const express = require('express');
const router = express.Router();
const Review = require("../../controllers/order/review.controller")
const userAuth = require('../../authentication/userAuth')

//เพิ่มรีวิว
router.post('/',userAuth.customer,Review.add);

//ดึงรีวิวทั้งหมด
router.get('/',userAuth.all,Review.getAll);

//ดึงรีวิวตามไอดี
router.get('/byid/:id',userAuth.all,Review.getByID);

//ดึงรีวิวตามไอดีสินค้า
router.get('/byproduct/:id',Review.getByProduct);

//แก้ไขรีวิว
router.put('/:id',userAuth.customer,Review.update);

//ลบรีวิว
router.delete('/:id',userAuth.customer,Review.delete);


module.exports = router;