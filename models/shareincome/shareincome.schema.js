const mongoose = require("mongoose");
const Joi = require("joi");

const ShareincomeSchema = new mongoose.Schema(
  {
    order_id: {type: mongoose.Schema.Types.ObjectId,ref:'order',default:null},
    delivery_id: {type: mongoose.Schema.Types.ObjectId,ref:'deliivery',default:null},
    alltotal: {type:Number,required: true},
    maruey: {type:Number,required: true},
    partner: {type: {
        partner_id:{type: mongoose.Schema.Types.ObjectId,ref:'partner',default:null},
        money:{type:Number,default:0}
    },default:null},
    customer: {
      shareproduct:{type:{
        customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
        money:{type:Number,default:0}, //(ให้คนที่แชร์ลิงค์สินค้า)
      },default:null}, // คนแชร์ลิงค์สินค้า
      
      level_one: {type:{
        customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
        money:{type:Number,default:0} //(ให้คนที่แนะนำเพื่อน)
      },default:null},
        level_two: {type:{
            customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
            money:{type:Number,default:0} //(ให้คนที่แนะนำเพื่อน)
        },default:null},
        level_three: {type:{
            customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
            money:{type:Number,default:0} //(ให้คนที่แนะนำเพื่อน)
        },default:null},
        level_four: {type:{
            customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
            money:{type:Number,default:0} //(ให้คนที่แนะนำเพื่อน)
        },default:null},
        level_five: {type:{
            customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
            money:{type:Number,default:0} //(ให้คนที่แนะนำเพื่อน)
        },default:null},
        level_six: {type:{
            customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
            money:{type:Number,default:0} //(ให้คนที่แนะนำเพื่อน)
        },default:null},
        level_seven: {type:{
            customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
            money:{type:Number,default:0} //(ให้คนที่แนะนำเพื่อน)
        },default:null},
        level_eight: {type:{
            customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
            money:{type:Number,default:0} //(ให้คนที่แนะนำเพื่อน)
        },default:null},
        level_nine: {type:{
            customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
            money:{type:Number,default:0} //(ให้คนที่แนะนำเพื่อน)
        },default:null},
        level_ten: {type:{
            customer_id:{type: mongoose.Schema.Types.ObjectId,ref:'customer',default:null},
            money:{type:Number,default:0} //(ให้คนที่แนะนำเพื่อน)
        },default:null},
    },
  },
  {timestamps: true}
);

const Shareincome = mongoose.model("shareincome", ShareincomeSchema);


module.exports = {Shareincome};