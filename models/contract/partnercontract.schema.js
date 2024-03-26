const mongoose = require("mongoose");
const Joi = require("joi");

const partnercontractschema = new mongoose.Schema(
    {
        logo:{type:String,require:false,default:""}, // รูปlogo
        header:{type:String,require:true}, // หัวข้อสัญญา
        detail:{type:String,require:true}, // รายละเอียดสัญญา
    },
    {timestamps: true}
);


const Partnercontract = mongoose.model("partnercontract", partnercontractschema);
module.exports = {Partnercontract};