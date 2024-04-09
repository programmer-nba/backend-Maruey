const {Requestproduct} = require('../../models/product/requestproduct.schema');
const {Product} = require('../../models/product/product.schema');
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


//เพิ่มคำร้องขอฝากขายสินค้า
module.exports.add = async (req, res) => {
    try{
        //request_status_detail
        const request_status_detail = {
            status:"รอการอนุมัติ",
            date:Date.now()
        }
        const data = new Requestproduct({
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
            request_status:false,
            request_status_detail:request_status_detail,
            admin_id:null
        });
        const add = await data.save();
        return res.status(200).json({ status:true,message: "คำร้องขอฝากขายสินค้าสำเร็จ",data: add });
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }

}

//ดึงข้อมูลคำร้องขอฝากขายสินค้าทั้งหมด
module.exports.getAll = async (req, res) => {
    try{
        const data = await Requestproduct.find().populate('product_partner_id').populate('product_category').populate('product_type');
        return res.status(200).json({ status:true,message: "ข้อมูลคำร้องขอฝากขายสินค้าทั้งหมด",data: data });
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }
}
//ดึงข้อมูลคำร้องขอฝากขายสินค้า by id
module.exports.getById = async (req, res) => {
    try{
        const data = await Requestproduct.findById(req.params.id).populate('product_partner_id').populate('product_category').populate('product_type');
        return res.status(200).json({ status:true,message: "ข้อมูลคำร้องขอฝากขายสินค้า",data: data });
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }
}
//ดึงข้อมูลคำร้องขอฝากขายสินค้า by partner_id
module.exports.getByPartnerId = async (req, res) => {
    try{
        const data = await Requestproduct.find({product_partner_id:req.params.id}).populate('product_partner_id').populate('product_category').populate('product_type');
        return res.status(200).json({ status:true,message: "ข้อมูลคำร้องขอฝากขายสินค้า",data: data });
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }
}

//อัพเดทข้อมูลคำร้องขอฝากขายสินค้า
module.exports.update = async (req, res) => {
    try{
        const checrequest = await Requestproduct.findById(req.params.id);
        if(checrequest){
            const data ={
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
                product_partner_id:req.body.product_partner_id,
                product_detail:req.body.product_detail,
                product_stock:req.body.product_stock,
            }
            const edit = await Requestproduct.findByIdAndUpdate(req.params.id,data,{new:true});
            return res.status(200).json({ status:true,message: "อัพเดทข้อมูลคำร้องขอฝากขายสินค้าสำเร็จ",data: edit });
        }
        return res.status(400).json({ status:false,message: "ไม่พบข้อมูลคำร้องขอฝากขายสินค้า" });
    }
    catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }
}

//ลบข้อมูลคำร้องขอฝากขายสินค้า
module.exports.delete = async (req, res) => {
    try{
        const checkrequest = await Requestproduct.findById(req.params.id);
        if(!checkrequest) return res.status(400).json({ status:false,message: "ไม่พบข้อมูลคำร้องขอฝากขายสินค้า" });
        const data = await Requestproduct.findByIdAndDelete(req.params.id);
        return res.status(200).json({ status:true,message: "ลบข้อมูลคำร้องขอฝากขายสินค้าสำเร็จ",data: data });
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }
}

//อนุมัติคำร้องขอฝากขายสินค้า
module.exports.approve = async (req, res) => {
    try{
        const checkrequest = await Requestproduct.findById(req.params.id);
        if(!checkrequest) return res.status(400).json({ status:false,message: "ไม่พบข้อมูลคำร้องขอฝากขายสินค้า" });
        //request_status_detail
        const request_status_detail = {
            status:"อนุมัติ",
            date:Date.now()
        }
        checkrequest.request_status_detail.push(request_status_detail);
        const data = await Requestproduct.findByIdAndUpdate(req.params.id,{request_status:true,request_status_detail:checkrequest.request_status_detail,admin_id:req.body.admin_id},{new:true});
        // เพิ่มข้อมูลสินค้า จาก ข้อมูลฝากขายสินค้า
        const product = new Product({
            product_name:data.product_name,
            product_status_type:data.product_status_type,
            product_category:data.product_category,
            product_type:data.product_type,
            product_costprice:data.product_costprice,
            product_price:data.product_price,
            product_weight:data.product_weight,
            product_width:data.product_width,
            product_long:data.product_long,
            product_height:data.product_height,
            product_store:data.product_store,
            product_partner_id:data.product_partner_id,
            product_detail:data.product_detail,
            product_stock:data.product_stock,
            product_image:data.product_image,
            product_status : true,
            rating:5
        });
        const add = await product.save();
        if(data && add )
        {
            return res.status(200).json({ status:true,message: "อนุมัติคำร้องขอฝากขายสินค้าสำเร็จ",data: data });
        }else{
            return res.status(400).json({ status:false,message: "ไม่สามารถอนุมัติคำร้องขอฝากขายสินค้าได้" });
        }
        
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
    }
}
//ไม่อนุมัติคำร้องขอฝากขายสินค้า
module.exports.disapprove = async (req, res) => {
    try{
        const checkrequest = await Requestproduct.findById(req.params.id);
        if(!checkrequest) return res.status(400).json({ status:false,message: "ไม่พบข้อมูลคำร้องขอฝากขายสินค้า" });
        //request_status_detail
        const request_status_detail = {
            status:"ไม่อนุมัติ",
            date:Date.now()
        }
        checkrequest.request_status_detail.push(request_status_detail);
        const data = await Requestproduct.findByIdAndUpdate(req.params.id,{request_status:false,request_status_detail:checkrequest.request_status_detail,admin_id:req.body.admin_id},{new:true});
        return res.status(200).json({ status:true,message: "ไม่อนุมัติคำร้องขอฝากขายสินค้าสำเร็จ",data: data });
    }catch(err){
        return res.status(500).json({ status:false,message: err.message });
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
        const product = await Requestproduct.findById(req.params.id);
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
        const edit = await Requestproduct.findByIdAndUpdate(req.params.id, data, { new: true })
        return res.status(200).send({ status: true, message: "เพิ่มรูปภาพเรียบร้อย", data: edit });
    });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }

};
