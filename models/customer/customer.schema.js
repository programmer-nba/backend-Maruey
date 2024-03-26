const mongoose = require("mongoose");
const Joi = require("joi");

const customerschema = new mongoose.Schema(
    {
        //ข้อมูลที่ต้องสมัครสมาชิกครั้งแรก
        email: {type: String, required: true, unique: true},
        telephone:{type:String,required:true,unique:true},
        password:{type:String,required:true},
        referralcode:{type:String,required:true}, //(รหัสผู้แนะนำ)
        prefix:{type:String,default:""}, //(คำนำหน้า)
        name :{type:String,default:""}, //(ชื่อ-สกุล)
        sex:{type:String,default:""}, //(เพศ)
        //
        birthday:{type:Date,default:null}, //(วันเดือนปีเกิด)
        nationality:{type:String,default:""}, //(สัญชาติ)
        idcard:{type:String,default:""}, //(เลขบัตรประชาชน)
        facebook: {type:String,default:""}, //(เฟสบุ๊ค)
        line_id: {type:String,default:""}, //(ไลน์ไอดี)

        bank:{type:{
            accountname:{type:String,default:""}, //(ชื่อบัญชี)
            accountnumber:{type:String,default:""}, //(เลขบัญชี) 
            name:{type:String,default:""}, //(ชื่อธนาคาร)
            branch:{type:String,default:""}, //(สาขา)
            imgbank:{type:String,default:""} // (รูปภาพบัญชี)
        },default:null},
        address:{type:{
            address:{type:String,default:""}, //(ที่อยู่)
            province:{type:String,default:""}, //(จังหวัด)
            amphure:{type:String,default:""}, //(อำเภอ)
            tambon: {type:String,default:""}, //(ตำบล)
            zipcode:{type:String,default:""}//(รหัสไปรษณีย์)
        },default:null}, //(ที่อยู่ตามบัตรประชาชน)
        addressdelivery:{type:[{
            name:{type:String,default:""}, //(ชื่อเรียก)
            address:{type:String,default:""}, //(ที่อยู่)
            province:{type:String,default:""}, //(จังหวัด)
            amphure:{type:String,default:""}, //(อำเภอ)
            tambon: {type:String,default:""}, //(ตำบล)
            zipcode:{type:String,default:""}//(รหัสไปรษณีย์)
        }],default:[]}, //ที่อยู่จัดส่ง
        pdpa : {type:Boolean,default:false}, //( true:ยอมรับเงื่อนไข , false: ยังไม่ยอมรับเงื่อนไข)
        upline:{
            recommendedcode:{type:String,default:""}, //(รหัสแนะนำ)
            level_one:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสระดับ1)
            level_two:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสระดับ2)
            level_three:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสระดับ3)
            level_four:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสระดับ4)
            level_five:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสระดับ5)
            level_six:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสระดับ6)
            level_seven:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสระดับ7)
            level_eight:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสระดับ8)
            level_nine:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสระดับ9)
            level_ten:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null}, //(รหัสระดับ10)
        }


},{timestamps: true});


const Customer = mongoose.model("customer", customerschema);

const validatecustomer = (data) => {
    const schema = Joi.object({
      email:Joi.string().required().label("กรุณากรอกอีเมล์"),
      telephone:Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
      password: Joi.string().required().label("กรุณากรอกpassword"),
      prefix:Joi.string().required().label("กรุณากรอกคำนำหน้า"),
      name:Joi.string().required().label("กรุณากรอกชื่อ-นามสกุล"),
      sex:Joi.string().required().label("กรุณากรอกเพศ"),
      recommendedcode: Joi.string().label("Recommended Code")
    });
    return schema.validate(data);
  };

module.exports = {Customer,validatecustomer};