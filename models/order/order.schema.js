const mongoose = require("mongoose");
const Joi = require("joi");

const orderschema = new mongoose.Schema(
    {
        
        orderref:{type:String,require:true,default:""}, // รหัสอ้างอิงออเดอร์
        customer_id :{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, // (ไอดีลูกค้า)
        status :{type:String,default:"กำลังดำเนินการออเดอร์"} ,  //“กำลังดำเนินการออเดอร์” , “ออเดอร์สำเร็จ” , “ยกเลิกออเดอร์” 
        statusdetail:{type:[{
            status : {type:String,default:""}, // สถานะ
            date : {type:Date,default:Date.now()}, // วันที่
        }],default:{status:"กำลังดำเนินการออเดอร์",date:Date.now()}},// รายละเอียดสถานะ
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
        suborder:{type:[{
            partner_id: {type: mongoose.Schema.Types.ObjectId,ref:'partner',default:null}, //(รหัสพาร์ทเนอร์)
            partner_name: {type:String,default:""},  //(ชื่อพาร์ทเนอร์)
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
            
           
            product : {type:[
                {
                    //product_id : {type: mongoose.Schema.Types.ObjectId,ref:'product',default:null},  //(รหัสสินค้า)
                    product_id: { type:String, default:"" },
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
            delivery_type : {type:String,default:""}, //(เลือกขนส่งอะไร)
            delivery_id :{type: mongoose.Schema.Types.ObjectId,ref:'deliivery',default:null}//(รหัสขนส่ง)
        }],default:null},// รายการสินค้า
        
        total:{type:Number,default:0}, //(รวมราคา)
        totaldelivery:{type:Number,default:0}, //(รวมค่าจัดส่ง)
        totaldiscount: {type:Number,default:0},//(รวมลดราคา)
        totalmarueycoin: {type:Number,default:0}, //(ใช้ maruey coins)
        alltotal:{type:Number,default:0},  //(รวมทั้งหมด)
        payment :{type:String,default:""},
        payment_id :{type:String,default:""},

    
    },{timestamps: true});


const Order = mongoose.model("order", orderschema);
module.exports = {Order};