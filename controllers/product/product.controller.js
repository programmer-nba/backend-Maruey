const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {Product,validateproduct} = require("../../models/product/product.schema");
const Checkalluse = require("../../functions/check-alluser");
const { PartnerProduct, PartnerProductPicture, PartnerProductLog } = require("../../models/product/product.schema");
const { Partner, PartnerPicture, PartnerLog } = require("../../models/partner/partner.schema");
const multer = require("multer");
const {
  uploadFileCreate,
  deleteFile,
} = require("../../functions/uploadfilecreate");
const fs = require("fs");
const path = require("path");

const generateProductCode = async () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


const storage = multer.diskStorage({
    // Specify the destination to save the uploaded files
    destination: function (req, file, cb) {
      cb(null, 'uploads/products/'); // Specify the folder (make sure it exists or create it)
    },
    // Set up the filename to avoid overwriting
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
  
const upload = multer({ storage: storage });
  
module.exports = { upload }

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
                product_costprice:req.body.product_costprice,
                product_price:req.body.product_price,
                product_weight:req.body.product_weight,
                product_width:req.body.product_width,
                product_long:req.body.product_long,
                product_height:req.body.product_height,
                product_store:req.body.product_store,
                product_partner_id: (req.body.product_partner_id == undefined || req.body.product_partner_id == '') ? null : req.body.product_partner_id,
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

module.exports.createPartnerProduct = async (req, res) => {
    const {
        name,
        description,
        partner_id,
        raw_price,
        discount,
        unit,
        product_type,
        category, // สินค้า, บริการ, อื่นๆ
        tags,
        stock,
        commission,
        commission_percent,
        pv
    } = req.body
    try {
        const code = await generateProductCode()
        const selling_price = raw_price - (discount || 0)
        const profit = selling_price - commission
        const newProduct = new PartnerProduct({
            code,
            name,
            description,
            partner_id,
            raw_price,
            discount,
            selling_price,
            profit,
            unit,
            product_type,
            category,
            tags,
            stock,
            commission,
            commission_percent,
            pv
        })

        const existProduct = await PartnerProduct.findOne({ partner_id: partner_id, name: name })
        if (existProduct) {
            return res.status(400).json({ message: "สื่อสินค้าซ้ำ", invalid: 'name' })
        }
        const savedProduct = await newProduct.save()
        return res.status(200).json({ message: "สำเร็จ", data: savedProduct, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: "Server Error"
        })
    }
}

module.exports.uploadProductImage = async (req, res) => {
    try {
      const product = await PartnerProduct.findById(req.body.product_id);
      if (!product) {
        return res.status(404).send({ message: "ไม่มีข้อมูลสินค้า" });
      }
      const image = req.file
      if (!image) {
        return res.status(400).send({ message: "กรุณาเลือกรูปภาพ" });
      }
      const oldFile = await PartnerProductPicture.findOne({ product_id: req.body.product_id, title: 'product', description: req.body.description });
      if (oldFile) {
        const filePath = path.join(__dirname, '..', '..', 'uploads', 'products', oldFile.path);
        //console.log(filePath);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.log('Error deleting file:', err);
              //return res.status(500).json({ message: 'Failed to delete the file' });
            }
            console.log('File deleted successfully');
            //res.status(200).json({ message: 'File deleted successfully' });
          });
        }
      }
      await PartnerProductPicture.deleteMany({ product_id: req.body.product_id, title: 'product', description: req.body.description });
      const savedImage = await PartnerProductPicture.create({
        title:  req.body.title,
        product_id: req.body.product_id,
        partner_id: req.body.partner_id,
        path: image.filename,
        description: req.body.description,
      });
      //console.log(image.filename);
      //partner.picture = savedImage._id;
      //await partner.save();
      return res.status(200).send({ message: "อัพโหลดรูปภาพสําเร็จ", data: savedImage });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  }
  
module.exports.getPartnerProductImage = async (req, res) => {
try {
    const productImages = await PartnerProductPicture.find({ product_id: req.params.product_id, title: 'product' });
    return res.status(200).send({ message: "ดึงรูปภาพสําเร็จ", status: true, path: 'file/', data: productImages });
} catch (error) {
    return res.status(500).send({ message: error.message });
}
}

module.exports.updatePartnerProduct = async (req, res) => {
    const {
        name,
        description,
        //shop_id,
        raw_price,
        discount,
        unit,
        product_type,
        category, // สินค้า, บริการ, อื่นๆ
        tags,
        stock,
        commission,
        status,
        pv
    } = req.body
    const { id } = req.params
    try {

        const existProduct = await PartnerProduct.findById(id)
        if (!existProduct) {
            return res.status(400).json({ message: "ไม่พบสินค้า" })
        }
        const duplicateProducts = await PartnerProduct.find({ partner_id: existProduct.partner_id, name: name, _id: { $ne: existProduct._id } })
        //console.log(existProduct.name, name)
        if (duplicateProducts.length) {
            return res.status(400).json({ message: "สื่อสินค้าซ้ำ", invalid: 'name' })
        }
        //const code = await generateProductCode()
        const selling_price = (raw_price || existProduct.raw_price) - (discount || existProduct.discount)
        const profit = (selling_price || existProduct.selling_price) - (commission || existProduct.commission)
        const updatedProduct = await PartnerProduct.findByIdAndUpdate( id, {
            //code,
            name,
            description,
            //shop_id,
            raw_price: raw_price || existProduct.raw_price,
            discount: discount || existProduct.discount,
            selling_price,
            profit: profit || existProduct.profit,
            unit,
            product_type,
            category,
            tags,
            stock,
            commission: commission || existProduct.commission,
            status,
            pv: pv || existProduct.pv
        }, { new: true })

        return res.status(200).json({ message: "สำเร็จ", data: updatedProduct, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: "Server Error"
        })
    }
}

module.exports.getPartnerProducts = async (req, res) => {
    const { status, shop_id, product_type, category } = req.query
    try {
        let filter = {}
        if (status) {
            filter.status = status
        }
        if (shop_id) {
            filter.partner_id = shop_id
        }
        if (product_type) {
            filter.product_type = product_type
        }
        if (category) {
            filter.category = category
        }
        const products = await PartnerProduct.find(filter)
        const formattedProducts = products.map(async product => {
            const productPictures = await PartnerProductPicture.find({ product_id: product._id, title: 'product' });
            const formattedPrictures = productPictures.map(picture => {
                return { path: `file/${picture.path}/product`, desc: parseInt(picture.description) }
            })
            const shop = await Partner.findById(product.partner_id)
            return {
                ...product._doc,
                images: formattedPrictures.sort((a, b) => a.desc - b.desc),
                shop_name: shop.name
            }
        })
        const promisedProducts = await Promise.all(formattedProducts)
        return res.status(200).json({ message: "success", data: promisedProducts, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: "Server Error"
        })
    }
}

module.exports.getPartnerProduct = async (req, res) => {
    const { id } = req.params
    try {
        const product = await PartnerProduct.findById(id)
        return res.status(200).json({ message: "success", data: product, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: "Server Error"
        })
    }
}

module.exports.deletePartnerProduct = async (req, res) => {
    const { id } = req.params
    try {
        const product = await PartnerProduct.findByIdAndDelete(id)
        const oldFiles = await PartnerProductPicture.find({ product_id: id });
        if (oldFiles.length) {
            for (const oldFile of oldFiles) {
                const filePath = path.join(__dirname, '..', '..', 'uploads', 'products', oldFile.path);
                //console.log(filePath);
                if (fs.existsSync(filePath)) {
                  fs.unlink(filePath, (err) => {
                    if (err) {
                      console.log('Error deleting file:', err);
                      //return res.status(500).json({ message: 'Failed to delete the file' });
                    }
                    console.log('File deleted successfully');
                    //res.status(200).json({ message: 'File deleted successfully' });
                  });
                }
            }
          }
        await PartnerProductPicture.deleteMany({ product_id: req.body.product_id, title: 'product', description: req.body.description });

        return res.status(200).json({ message: "success", data: product, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: "Server Error"
        })
    }
}

//ดึงข้อมูลสินค้าทั้งหมด 
module.exports.getall = async (req, res) => {
    try{
        //const get = await Product.find().populate('product_partner_id').populate('product_category').populate('product_type');
        return res.status(200).json({
            message:"success",
            version:'2.8',
            status:true
        });
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}


//ดึงข้อมูลสินค้าตามไอดี
module.exports.getbyid = async (req, res) => {
    try{
        const get = await Product.findById(req.params.id).populate('product_partner_id').populate('product_category').populate('product_type');
        if(get){
            return res.status(200).json({message:"ดึงข้อมูลสินค้าสำเร็จ",data:get,status:true});
        }else{
            return res.status(400).json({message:"ดึงข้อมูลสินค้าไม่สำเร็จ",status:false});
        }
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}


//ค้นหาสินค้าตามที่กรอกเข้ามา
module.exports.search = async (req, res) => {
    try{
        //เวลาใส่ชื่อเต็มมันค้นหาไม่เจอ แก้ไง
        const get = await Product.find({
            $or: [
                { product_name: { $regex: req.params.name, $options: 'i' } },
                { product_name:  req.params.name }
            ]
        }).populate('product_partner_id').populate('product_category').populate('product_type');
        if(get){
            return res.status(200).json({message:"ค้นหาสินค้าสำเร็จ",data:get,status:true});
        }else{
            return res.status(400).json({message:"ค้นหาสินค้าไม่สำเร็จ",status:false});
        }
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}


//ดึงข้อมูลตามหมวดหมู่สินค้า
module.exports.getbycategory = async (req, res) => {
    try{
        const get = await Product.find({product_category:req.params.id}).populate('product_partner_id').populate('product_category').populate('product_type');
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

            //const ispending = check.product_price !== req.body.product_price ? true : false
            
            const edit = await Product.findByIdAndUpdate(req.params.id,{
                product_name:req.body.product_name,
                product_status_type:req.body.product_status_type,
                product_category:req.body.product_category,
                product_type:req.body.product_type,
                product_costprice:req.body.product_costprice,
                product_price:req.body.product_price,
                product_weight:req.body.product_weight,
                product_width:req.body.product_width,
                product_long:req.body.product_long,
                product_height:req.body.product_height,
                product_store:req.body.product_store,
                product_partner_id: (req.body.product_partner_id == undefined || req.body.product_partner_id == '') ? null : req.body.product_partner_id,
                product_detail:req.body.product_detail,
                product_stock:req.body.product_stock,
                pending: true
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

module.exports.approveEdited = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findByIdAndUpdate(id, {
            $set: {
                pending: false
            }
        }, { new: true })
        if (!product) {
            return res.status(404).json({ message: "not found" })
        }

        return res.status(201).json({
            message: "อนุมัติสินค้าสำเร็จ",
            status: true
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({message:error.message, status: false})
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

//ค้นหาตาม partner ตาม id
module.exports.getbypartner = async (req, res) => {
    try{
        const get = await Product.find({product_partner_id:req.params.id}).populate('product_partner_id').populate('product_category').populate('product_type');
        if(get){
            return res.status(200).json({message:"ดึงข้อมูลสินค้าสำเร็จ",data:get,status:true});
        }else{
            return res.status(400).json({message:"ดึงข้อมูลสินค้าไม่สำเร็จ",status:false});
        }
    }catch(error){
        return res.status(500).json({message:error.message, status: false});
    }
}
