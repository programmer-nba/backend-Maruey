const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {Partnercontract} = require("../../models/contract/partnercontract.schema");
const Checkalluse = require("../../functions/check-alluser");

const multer = require("multer");
const {
  uploadFileCreate,
  deleteFile,
} = require("../../functions/uploadfilecreate");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
    //console.log(file.originalname);
  },
});

//เพิ่มข้อมูลสัญญาdealer
exports.addPartnercontract = async (req, res) => {
  try{
    const {head,detail} = req.body;
    const partnercontract = new Partnercontract({
      header:head,
      detail:detail,
    });
    const save = await partnercontract.save();
    return res.status(200).send({message:"สร้างสัญญาสำเร็จ",data:save,status:true});

  }catch(err){
    return res.status(500).send({message:err.message,status:false});
}
};
  
//ดึงข้อมูลสัญญาdealer
exports.getallPartnercontract = async (req, res) => {
  try{
    const get = await Partnercontract.find();
    return res.status(200).send({message:"ดึงข้อมูลสัญญาสำเร็จ",data:get,status:true});
  }catch(err){
    return res.status(500).send({message:err,status:false});
  }
};

//แก้ไขข้อมูลสัญญาdealer
exports.editPartnercontract = async (req, res) => {
  try{
    const {header,detail} = req.body;
    const update = await Partnercontract.findByIdAndUpdate(req.params.id,{
      header:header,
      detail:detail,
    });
    return res.status(200).send({message:"แก้ไขสัญญาสำเร็จ",data:update,status:true});
    }catch(err){
        return res.status(500).send({message:err,status:false});
    }
}

//ลบข้อมูลสัญญาdealer
exports.deletePartnercontract = async (req, res) => {
  try{
    const del = await Partnercontract.findByIdAndDelete(req.params.id);
    return res.status(200).send({message:"ลบสัญญาสำเร็จ",data:del,status:true});
  }catch(err){
    return res.status(500).send({message:err,status:false});
  }
}

//รูปlogo 
exports.addimglogo = async (req, res) => {
  try{
    let upload = multer({ storage: storage }).array("image", 20);
    upload(req, res, async function (err) {
        const reqFiles = [];
        const result = [];
        if (err) {
            return res.status(500).send(err);
        }
        const partnercontract = await Partnercontract.findById(req.params.id);
        if(!partnercontract){
            return res.status(400).json({message:"ไม่พบข้อมูลสินค้า",status:false});
        }else{
           partnercontract.logo != ''? deleteFile( partnercontract.logo) : null
        }

        let image = '' // ตั้งตัวแปรรูป
        //ถ้ามีรูปให้ทำฟังก์ชั่นนี้ก่อน
        if (req.files) {
            const url = req.protocol + "://" + req.get("host");
            for (var i = 0; i < req.files.length; i++) {
                const src = await uploadFileCreate(req.files, res, { i, reqFiles });
                result.push(src);
                //   reqFiles.push(url + "/public/" + req.files[i].filename);
            }
            image = reqFiles[0]
        }
        const update = await Partnercontract.findByIdAndUpdate(req.params.id,{logo:image},{new:true});
        return res.status(200).send({message:"เพิ่มรูปสำเร็จ",data:update,status:true});
    });
  }catch(err){
    return res.status(500).send({message:err,status:false});
  }
}