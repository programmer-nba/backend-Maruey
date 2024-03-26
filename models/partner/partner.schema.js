const mongoose = require("mongoose");
const Joi = require("joi");

const PartnerSchema = new mongoose.Schema(
  {
    email:{type:String,require:true,unique: true},
    telephone:{type:String,require:true,unique:true},
    password: {type: String, required: true},
    name:{type:String,required:true},
    referralcode:{type:String,required:true,unique:true}, //รหัสผู้แนะนำ
    address:{type:{
        address:{type:String,default:""}, //(ที่อยู่)
        province:{type:String,default:""}, //(จังหวัด)
        amphure:{type:String,default:""}, //(อำเภอ)
        tambon: {type:String,default:""}, //(ตำบล)
        zipcode:{type:String,default:""}//(รหัสไปรษณีย์)	        
    },required:false,default:null},
    company_name:{type:String,default:""}, //(ชื่อบริษัท)
    company_taxid:{type:String,default:""}, //(เลขประจำตัวผู้เสียภาษี):
    company_address:{type:{
        address:{type:String,default:""}, //(ที่อยู่บริษัท)
        province:{type:String,default:""}, //(จังหวัด)
        amphure:{type:String,default:""}, //(อำเภอ)
        tambon: {type:String,default:""}, //(ตำบล)
        zipcode:{type:String,default:"" }
    },default:null}, //(ที่อยู่บริษัท)
    partner_status:{type:Boolean,default:false},  //(true: อนุมัติ ,false: ไม่อนุมัติ)
    partner_status_promiss: {type:Boolean,default:false},  //( true:ยอมรับเงื่อนไข , false: ยังไม่ยอมรับเงื่อนไข)  // สัญญา partner
    pdpa : {type:Boolean,default:false}, //( true:ยอมรับเงื่อนไข , false: ยังไม่ยอมรับเงื่อนไข) 
    bank:{type:{
        accountname:{type:String,default:""}, //(ชื่อบัญชี)
        accountnumber:{type:String,default:""}, //(เลขบัญชี) 
	    namebank:{type:String,default:""}, //(ชื่อธนาคาร)
        branch:{type:String,default:""}, //(สาขา)
        imgbank:{type:String,default:""} // (รูปภาพบัญชี)
    },default:null},
    iden:{type:{ //(บัตรประชาชน)
        iden_number:{type:String,default:""}, //(เลขบัตรประชาชน)
	    iden_image:{type:String,default:""}, //(รูปภาพบัตรประชาชน)
    },default:null},
    commission :{type:Number,default:0} //(ค่าคอมมิสชั่น)
  },
  {timestamps: true}
);

const Partner = mongoose.model("partner", PartnerSchema);


const validatepartner = (data) => {
  const schema = Joi.object({
    email:Joi.string().required().label("กรุณากรอกอีเมล์"),
    telephone:Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
    password: Joi.string().required().label("กรุณากรอกpassword"),
    name:Joi.string().required().label("กรุณากรอกชื่อ-นามสกุล"),
    referralcode:Joi.string().required().label("กรุณากรอกรหัสผู้แนะนำ"),
  });
  return schema.validate(data);
};



module.exports = {Partner,validatepartner};