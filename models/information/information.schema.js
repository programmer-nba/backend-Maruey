const mongoose = require("mongoose");
const Joi = require("joi");

const informationschema = new mongoose.Schema(
    {
       address:{      
            namedelivery: {type:String,default:""}, //(ชื่อผู้รับ)
            telephone: {type:String,default:""}, //(เบอร์โทร)
            address: {type:String,default:""},
            tambon: {type:String,default:""},
            amphure: {type:String,default:""},
            province: {type:String,default:""},
            zipcode: {type:String,default:""},
        }, //(ที่อยู่ผู้รับ)
    },
    {timestamps: true}
);


const Information = mongoose.model("information", informationschema);
module.exports = {Information};