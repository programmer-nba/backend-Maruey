const mongoose = require("mongoose");
const Joi = require("joi");
// Define the schema for the HotelUser entity
const AdminSchema = new mongoose.Schema(
  {
    email:{type:String,require:true,unique: true},
    telephone:{type:String,require:true,unique:true},
    password: {type: String, required: true},
    name:{type:String,required:true},
    position:{type:String,required:true},
  },
  {timestamps: true}
);

const Admin = mongoose.model("admin", AdminSchema);


const validateadmin = (data) => {
  const schema = Joi.object({
    email:Joi.string().required().label("กรุณากรอกอีเมล์"),
    telephone:Joi.string().required().label("กรุณากรอกเบอร์โทรศัพท์"),
    password: Joi.string().required().label("กรุณากรอกpassword"),
    name:Joi.string().required().label("กรุณากรอกชื่อ-นามสกุล"),
    position:Joi.string().required().label("กรุณาตำแหน่ง"),
  });
  return schema.validate(data);
};



module.exports = {Admin,validateadmin};