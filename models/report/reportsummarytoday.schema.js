const mongoose = require("mongoose");

const reportsummarytodayschema = new mongoose.Schema(
    {
        date:{type:Date,require:true}, // วันที่
        partner:{type:Number,require:true}, // จำนวน partner ทั้งหมด
        customer:{type:Number,require:true}, // จำนวนลูกค้าทั้งหมด
        money:{type:Number,require:true}, //  ยอดรวมเงินคงเหลือในระบบ

    },
);


const Reportsummarytoday = mongoose.model("reportsummarytoday", reportsummarytodayschema);
module.exports = {Reportsummarytoday};