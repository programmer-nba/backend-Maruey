const mongoose = require("mongoose");
const Joi = require("joi");

const PercentprofitSchema = new mongoose.Schema(
  {
    percentpartner: {
        owner: {type:Number,required: true},
        platform: {type: Number,required: true},
        separateplatform: {
            platform: {type: Number,required: true},
            sharelink: {type: Number,required: true}
        }
    },
    percentmaruey: {
        owner: {type: Number,required: true},
        sharelink: {type: Number,required: true}
    },
    sharelink: {
        level_one: {type: Number,required: true},
        level_two: {type: Number,required: true},
        level_three: {type: Number,required: true},
        level_four: {type: Number,required: true},
        level_five: {type: Number,required: true},
        level_six: {type: Number,required: true},
        level_seven: {type: Number,required: true},
        level_eight: {type: Number,required: true},
        level_nine: {type: Number,required: true},
        level_ten: {type: Number,required: true}
    }
  },
  {timestamps: true}
);

const Percentprofit = mongoose.model("percentprofit", PercentprofitSchema);




module.exports = {Percentprofit};