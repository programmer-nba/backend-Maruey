const mongoose = require("mongoose");
const Joi = require("joi");

const categoryschema = new mongoose.Schema(
    {
        category_name:{type:String,require:true}, // ชื่อหมวดหมู่สินค้า
    },
    {timestamps: true}
);


const Category = mongoose.model("category", categoryschema);
module.exports = {Category};