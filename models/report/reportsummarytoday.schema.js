const mongoose = require("mongoose");

const reportsummarytodayschema = new mongoose.Schema(
    {
        date:{type:String,require:true}, // วันที่
        money:{type:Number,require:true}, // เงินคงเหลือในระบบ

    },
);


const Reportsummarytoday = mongoose.model("reportsummarytoday", reportsummarytodayschema);
module.exports = {Reportsummarytoday};