const mongoose = require("mongoose");
const Joi = require("joi");

const typeSchema = new mongoose.Schema(
    {
        type_name:{type:String,require:true,unique:true}, // ชื่อหมวดหมู่สินค้าย่อย
    },
    {timestamps: true}
);

const Type = mongoose.model("type", typeSchema);
module.exports = {Type};

