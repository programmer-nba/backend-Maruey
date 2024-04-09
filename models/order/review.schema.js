const mongoose = require("mongoose");


const reviewschema = new mongoose.Schema(
    {
        order_id :{type: mongoose.Schema.Types.ObjectId,ref:'order',default:null}, //(รหัสออเดอร์)
        deliivery_id :{type: mongoose.Schema.Types.ObjectId,ref:'deliivery',default:null}, //(รหัสการจัดส่ง)
        customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสลูกค้า)
        product:{type:[{
            product_id:{type: mongoose.Schema.Types.ObjectId,ref:'product',default:null}, //(รหัสสินค้า)   
        }],default:null},
        rating:{type:Number,default:0}, //(จำนวนดาว)
        comment:{type:String,default:""}, //(ความคิดเห็น)
    },{timestamps: true});


const Review = mongoose.model("review", reviewschema);
module.exports = {Review};