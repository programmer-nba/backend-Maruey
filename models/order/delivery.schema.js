const mongoose = require("mongoose");
const Joi = require("joi");

const deliiveryschema = new mongoose.Schema(
    {
        delivery_type:{type:String,default:""}, //(เลือกขนส่งอะไร)
        order_id :{type: mongoose.Schema.Types.ObjectId,ref:'order',default:null}, //(รหัสออเดอร์)
        refdelivery :{type:String,default:""}, //(รหัสการจัดส่ง)   
        partner_id:{type: mongoose.Schema.Types.ObjectId,ref:'partner',default:null},
        customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสลูกค้า)
        address:{
            name:{type:String,default:""},
            namedelivery: {type:String,default:""}, //(ชื่อผู้รับ)
            telephone: {type:String,default:""}, //(เบอร์โทร)
            address: {type:String,default:""},
            tambon: {type:String,default:""},
            amphure: {type:String,default:""},
            province: {type:String,default:""},
            zipcode: {type:String,default:""},
        }, //(ที่อยู่ผู้รับ)
        partneraddress :
        {
            namedelivery: {type:String,default:""}, //(ชื่อผู้ส่ง)
            telephone: {type:String,default:""}, //(เบอร์โทร)
            address: {type:String,default:""},
            tambon: {type:String,default:""},
            amphure: {type:String,default:""},
            province: {type:String,default:""},
            zipcode: {type:String,default:""},
        }, //(ที่อยู่ผู้ส่ง)

        partner_name:{type:String,default:""}, //(ชื่อพาร์ทเนอร์)
        tracking : {type:String,default:""}, // ติดตามสถานะ
        product :{type:[
            {
                product_id : {type: mongoose.Schema.Types.ObjectId,ref:'product',default:null},  //(รหัสสินค้า)
                product_name :{type:String,default:""}, //(ชื่อสินค้า)
                product_image:{type:String,default:""}, //(รูปสินค้า)
                product_price :{type:Number,default:0},//(ราคา)
                product_qty : {type:Number,default:0}, //(จำนวน)
                product_store:{type:String,default:""}, //(คลังของใคร)
                product_totalprice:{type:Number,default:0}, // (ราคารวม)
                promotioncode: {type:String,default:""}, //(รหัสโปรโมชั่น)
                sharelinkcode : {type:String,default:""} //(รหัสคนแชร์ลิงค์)
            }
        ],default:null}, // สินค้า
        totalproduct:{type:Number,default:0}, //(ราคารวมสินค้า)
        delivery:{type:Number,default:0}, // (ค่าขนส่ง)
        alltotal:{type:Number,default:0}, //(ราคารวม)
        status:{type:String,default:""}, // “กำลังเตรียมจัดส่ง” , “จัดส่งสินค้า” , “ได้รับสินค้าแล้ว” ,” ตีกลับสินค้า”
        detail : {type:[{
            status : {type:String,default:""}, // สถานะ
            date : {type:Date,default:Date.now()}, // วันที่
        }],default:null},
        note:{type:String,default:""}, //(หมายเหตุขนส่ง)
        shareincome_id:{type: mongoose.Schema.Types.ObjectId,ref:'shareincome',default:null}, // รหัสแชร์รายได้
    },{timestamps: true});


const Deliivery = mongoose.model("deliivery", deliiveryschema);
module.exports = {Deliivery};