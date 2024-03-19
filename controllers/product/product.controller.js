const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {Product,validateproduct} = require("../../models/product/product.schema");
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

  //เพิ่มข้อมูลสินค้า
module.exports.add = async (req, res) => {
    try{
            //เช็คข้อมูลที่กรอกเข้ามา
            const error = validateproduct(req.body);
            if(error.status == false){
                return res.status(400).send({ message: error.details[0].message, status: false });
            }
         
            const add = new Product({
                product_name:req.body.product_name,
                product_status_type:req.body.product_status_type,
                product_category:req.body.product_category,
                product_type:req.body.product_type,
                product_price:req.body.product_price,
                product_store:req.body.product_store,
                product_dealer_id: (req.body.product_dealer_id == undefined || req.body.product_dealer_id == '') ? null : req.body.product_dealer_id,
                product_detail:req.body.product_detail,
                product_stock:req.body.product_stock,
                product_status:false
            });

            const save = await add.save();
            if(save){
                return res.status(200).json({message:"เพิ่มสินค้าสำเร็จ",data:save,status:true});
            }else{
                return res.status(400).json({message:"เพิ่มสินค้าไม่สำเร็จ",status:false});
            }
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}

//ดึงข้อมูลสินค้าทั้งหมด 
module.exports.getall = async (req, res) => {
    try{
        const get = await Product.find().populate('product_dealer_id').populate('product_category').populate('product_type');
        if(get){
            return res.status(200).json({message:"ดึงข้อมูลสินค้าสำเร็จ",data:get,status:true});
        }else{
            return res.status(400).json({message:"ดึงข้อมูลสินค้าไม่สำเร็จ",status:false});
        }
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}


//ดึงข้อมูลสินค้าตามไอดี
module.exports.getbyid = async (req, res) => {
    try{
        const get = await Product.findById(req.params.id).populate('product_dealer_id').populate('product_category').populate('product_type');
        if(get){
            return res.status(200).json({message:"ดึงข้อมูลสินค้าสำเร็จ",data:get,status:true});
        }else{
            return res.status(400).json({message:"ดึงข้อมูลสินค้าไม่สำเร็จ",status:false});
        }
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}


//แก้ไขข้อมูลสินค้า
module.exports.edit = async (req, res) => {
    try{

            //เช็คข้อมูลที่กรอกเข้ามา
            const error = validateproduct(req.body);
            if(error.status == false){
                return res.status(400).send({ message: error.details[0].message, status: false });
            }
            //เช็คว่ามีไอดีนี้หรือไม่
            const check = await Product.findById(req.params.id);
            if(!check){
                return res.status(400).json({message:"ไม่พบข้อมูลสินค้า",status:false});
            }
            
            const edit = await Product.findByIdAndUpdate(req.params.id,{
                product_name:req.body.product_name,
                product_status_type:req.body.product_status_type,
                product_category:req.body.product_category,
                product_type:req.body.product_type,
                product_price:req.body.product_price,
                product_store:req.body.product_store,
                product_dealer_id: (req.body.product_dealer_id == undefined || req.body.product_dealer_id == '') ? null : req.body.product_dealer_id,
                product_detail:req.body.product_detail,
                product_stock:req.body.product_stock,
            },{new:true});

            if(edit){
                return res.status(200).json({message:"แก้ไขสินค้าสำเร็จ",data:edit,status:true});
            }else{
                return res.status(400).json({message:"แก้ไขสินค้าไม่สำเร็จ",status:false});
            }
     
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}
//ลบข้อมูลสินค้า
module.exports.delete = async (req, res) => {
    try{
        const check = await Product.findById(req.params.id);
        if(!check){
            return res.status(400).json({message:"ไม่พบข้อมูลสินค้า",status:false});
        }
        const del = await Product.findByIdAndDelete(req.params.id);
        if(del){
            check.product_image != ''? deleteFile(check.product_image) : null
            return res.status(200).json({message:"ลบสินค้าสำเร็จ",status:true});
        }else{
            return res.status(400).json({message:"ลบสินค้าไม่สำเร็จ",status:false});
        }
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}


//เปิด-ปิดขายสินค้า
module.exports.status = async (req, res) => {
    try{
        const check = await Product.findById(req.params.id);
        if(!check){
            return res.status(400).json({message:"ไม่พบข้อมูลสินค้า",status:false});
        }
        const status = await Product.findByIdAndUpdate(req.params.id,{product_status:req.body.product_status},{new:true});
        if(status){
            return res.status(200).json({message:"เปลี่ยนสถานะสินค้าสำเร็จ",data:status,status:true});
        }else{
            return res.status(400).json({message:"เปลี่ยนสถานะสินค้าไม่สำเร็จ",status:false});
        }
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}


//เพิ่มรูปสินค้า
module.exports.addimgproduct = async (req, res) => {
    try{
    let upload = multer({ storage: storage }).array("image", 20);
    upload(req, res, async function (err) {
        const reqFiles = [];
        const result = [];
        if (err) {
            return res.status(500).send(err);
        }
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(400).json({message:"ไม่พบข้อมูลสินค้า",status:false});
        }else{
            product.product_image != ''? deleteFile(product.product_image) : null
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
        const data = { product_image: image }
        const edit = await Product.findByIdAndUpdate(req.params.id, data, { new: true })
        return res.status(200).send({ status: true, message: "เพิ่มรูปภาพเรียบร้อย", data: edit });
    });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }

};

//ค้นหาตาม dealer ตาม id
module.exports.getbydealer = async (req, res) => {
    try{
        const get = await Product.find({product_dealer_id:req.params.id}).populate('product_dealer_id').populate('product_category').populate('product_type');
        if(get){
            return res.status(200).json({message:"ดึงข้อมูลสินค้าสำเร็จ",data:get,status:true});
        }else{
            return res.status(400).json({message:"ดึงข้อมูลสินค้าไม่สำเร็จ",status:false});
        }
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}
