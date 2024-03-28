const mongoose = require("mongoose");
const Joi = require("joi");

const RequestProductSchema = new mongoose.Schema(
  {
    product_name:{type:String,require:true}, // ชื่อสินค้า
    product_status_type:{type:String,default:true}, //สถานะสินค้า   (ฝากขาย , สินค้าของตัวเอง)
    product_category:{type: mongoose.Schema.Types.ObjectId,ref:'category',default:null}, //หมวดหมู่สินค้า
    //ดึงข้อมูลมาจาก type แต่จะ ref เป็น array มายังไง
    product_type:{type:[{type: mongoose.Schema.Types.ObjectId,ref:'type',default:null}],default:null},
    product_costprice:{type:Number,require:true},//ราคาต้นทุน
    product_price:{type:Number,require:true}, //ราคาสินค้า
    product_weight:{type:Number,require:true},//น้ำหนัก
    product_width:{type:Number,require:true},//กว้าง
    product_long:{type:Number,require:true},//ยาว
    product_height:{type:Number,require:true},//สูง

    product_store :{type:String,require:true}, //(ของตัวเอง,ของคู่ค้า)
    product_partner_id:{type: mongoose.Schema.Types.ObjectId,ref:'partner',default:null}, //ไอดีคู่ค้า
    product_detail:{type:String,require:true}, //รายละเอียดสินค้า
    product_stock:{type:Number,require:true}, //จำนวนสินค้า
    product_image:{type:String,default:""}, //รูปภาพสินค้า
    request_status:{type:Boolean,default:false}, //สถานะการขอสินค้า (true: อนุมัติ , false: รอการอนุมัติ)
    request_status_detail:{type:[{
      status:{type:String,default:""}, //สถานะการขอสินค้า
      date:{type:Date,default:Date.now()} //วันที่เปลี่ยนสถานะ
    }],default:[]}, //รายละเอียดสถานะการขอสินค้า
    admin_id:{type: mongoose.Schema.Types.ObjectId,ref:'admin',default:null}, //คนอนุมัติ

  },
  {timestamps: true}
);

const Requestproduct = mongoose.model("requestproduct", RequestProductSchema);


module.exports = {Requestproduct};