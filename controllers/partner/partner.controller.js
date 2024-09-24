const bcrypt = require("bcryptjs");
const { Partner, PartnerPicture, PartnerLog } = require("../../models/partner/partner.schema");
const Checkalluse = require("../../functions/check-alluser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  uploadFileCreate,
  deleteFile,
} = require("../../functions/uploadfilecreate");

const storage = multer.diskStorage({
  // Specify the destination to save the uploaded files
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the folder (make sure it exists or create it)
  },
  // Set up the filename to avoid overwriting
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

module.exports = { upload }

//สร้างไอดี Partner (คู่ค้า)
module.exports.createPartner = async (req, res) => {
  let { 
    business_type,
    customer_id,
    customer_username,
    name,
    tax_id,
    address,
    moo,
    soi,
    road,
    tambon,
    amphure,
    province,
    zipcode,
    phone,
    map_url,
    map_iframe,
    map_lat,
    map_lon,
    open_days,
    open_time,
    close_time,
    description,
    introduced_id
  } = req.body
  try {
      const existPartner = await Partner.findOne({ customer_username: customer_username })
      if (existPartner) {
        return res.status(400).json({
          message: 'user นี้ ได้สมัคร partner แล้ว'
        })
      }
      const code = `PM${customer_username}`
      const newPartner = new Partner({
        code: code,
        business_type,
        customer_id,
        customer_username,
        name,
        tax_id,
        address,
        moo,
        soi,
        road,
        tambon,
        amphure,
        province,
        zipcode,
        phone,
        map_url,
        map_iframe,
        map_lat,
        map_lon,
        open_days,
        open_time,
        close_time,
        description,
        introduced_id
      })

      const savedPartner = await newPartner.save()

      const partnerLog = new PartnerLog({
        action: "register",
        partner_id: savedPartner._id,
        description: "สมัคร partner ใหม่",
      })

      await partnerLog.save()

      return res.status(201).json({
        message: 'success',
        status: true,
        data: {
          name: savedPartner.name,
          code: savedPartner.code,
          _id: savedPartner._id
        }
      })
      
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: err.message });
  }
};

module.exports.updatePartner = async (req, res) => {
  let { 
    //business_type,
    //customer_id,
    //customer_username,
    name,
    tax_id,
    address,
    moo,
    soi,
    road,
    tambon,
    amphure,
    province,
    zipcode,
    phone,
    map_url,
    map_iframe,
    map_lat,
    map_lon,
    open_days,
    open_time,
    close_time,
    description,
    introduced_id,
    stars
  } = req.body
  const { id } = req.params
  try {
    const existPartner = await Partner.findById(id)
    if (!existPartner) {
      return res.status(400).json({
        message: 'ไม่มี partner นี้ในระบบ'
      })
    }
      const duplicatedPartner = await Partner.findOne({ name: name })
      if (duplicatedPartner?.name && duplicatedPartner?.name !== existPartner.name) {
        return res.status(400).json({
          message: 'มีชื่อ partner นี้ในระบบแล้ว'
        })
      }

      //const code = `PM${existPartner.customer_username}`
      const updatedPartner = await Partner.findByIdAndUpdate( id, {
        //business_type,
        //customer_id,
        //customer_username,
        //code: code,
        name,
        tax_id,
        address,
        moo,
        soi,
        road,
        tambon,
        amphure,
        province,
        zipcode,
        phone,
        map_url,
        map_iframe,
        map_lat,
        map_lon,
        open_days,
        open_time,
        close_time,
        description,
        introduced_id,
        stars
      }, { new: true })

      if (!updatedPartner) {
        return res.status(400).json({
          message: 'ไม่สามารถอัพเดทข้อมูล partner ได้'
        })
      }

      const partnerLog = new PartnerLog({
        action: "update",
        partner_id: id,
        description: "อัพเดทข้อมูล partner",
      })

      await partnerLog.save()

      return res.status(201).json({
        message: 'success',
        status: true,
        //data: updatedPartner
      })
      
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: err.message });
  }
};

//ดึงข้อมูลทั้งหมด
module.exports.getall = async (req, res) => {
  try {
    const partnerdata = await Partner.find();
    if (!partnerdata) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
    }
    return res.status(200).send({ status: true, data: partnerdata });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

module.exports.uploadPartnerImage = async (req, res) => {
  try {
    const partner = await Partner.findById(req.body.shop_id);
    if (!partner) {
      return res.status(404).send({ message: "ไม่มีข้อมูลคู่ค้า" });
    }
    const image = req.file
    if (!image) {
      return res.status(400).send({ message: "กรุณาเลือกรูปภาพ" });
    }
    const oldFile = await PartnerPicture.findOne({ partner_id: req.body.shop_id, title: 'shopPicture', description: req.body.description });
    if (oldFile) {
      const filePath = path.join(__dirname, '..', '..', 'uploads', oldFile.path);
      console.log(filePath);
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
    await PartnerPicture.deleteMany({ partner_id: req.body.shop_id, title: 'shopPicture', description: req.body.description });
    const savedImage = await PartnerPicture.create({
      title:  req.body.title,
      partner_id: req.body.shop_id,
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

module.exports.getPartnerImage = async (req, res) => {
  try {
    const partnerImages = await PartnerPicture.find({ partner_id: req.params.shop_id, title: 'shopPicture' });
    return res.status(200).send({ message: "ดึงรูปภาพสําเร็จ", status: true, path: 'file/', data: partnerImages });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}

//ดึงข้อมูล by id
module.exports.getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id).select("-__v");
    if (!partner) {
      return res.status(404).send({ message: "ไม่มีข้อมูลคู่ค้า" });
    }
    return res.status(200).json({ status: true, data: partner });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getPartnerByUsername = async (req, res) => {
  try {
    const partner = await Partner.findOne({ customer_username: req.params.username}).select("-__v");
    if (!partner) {
      return res.status(404).send({ message: "ไม่มีข้อมูลคู่ค้า" });
    }
    return res.status(200).json({ status: true, data: partner });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//แก้ไขข้อมูล Partner
module.exports.edit = async (req, res) => {
  try {
    const partner = await Partner.findOne({ _id: req.params.id });
    if (!partner) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
    }
    
    //เช็คว่ากรอกข้อมูลครบที่จำเป็นไหม
    const error = validatepartner(req.body);
    if(error.status == false){
      return res.status(400).send({ message: error.details[0].message, status: false });
    }
      //เช็ค username ซ้ำ
      if(partner.username != req.body.username)
        {
          const checkusername = await Checkalluse.CheckUsername(req.body.username);
          if (checkusername == true) {
            return res.status(409).send({ status: false, message: "username นี้มีคนใช้แล้ว" });
          }
        }

      if(partner.email != req.body.email)
      {
        const checkemail = await Checkalluse.CheckEmail(req.body.email);
        if (checkemail == true) {
          return res.status(409).send({ status: false, message: "email นี้มีคนใช้แล้ว" });
        }
      }  

      if(partner.telephone != req.body.telephone)
      {
        const checktelephone = await Checkalluse.CheckTelephone(req.body.telephone);
        if (checktelephone == true) {
          return res.status(409).send({ status: false, message: "เบอร์โทรศัพท์ นี้มีคนใช้แล้ว" });
        }
      }

      if(partner.company_taxid != req.body.company_taxid)
      {
        //เช็คว่าเลขบัตรประจำตัวผู้เสียภาษีซ้ำไหม
        const checkcompany_taxid = await Partner.find({ company_taxid: req.body.company_taxid });
        if (checkcompany_taxid.length !== 0) {
          return res.status(409).send({ status: false, message: "เลขประจำตัวผู้เสียภาษี นี้มีคนใช้แล้ว" });
        }
      }
  
      const data = {
        username: req.body.username,
        email: req.body.email,
        telephone: req.body.telephone,
        password:  (req.body.password !=undefined && req.body.password!=''? bcrypt.hashSync(req.body.password, 10):Partner.password), // ถ้าไม่ได้มีการส่ง password มาให้ทำการ ใช้ password เดิม
        name: req.body.name,
        address: req.body.address,
        company_name: req.body.company_name, //(ชื่อบริษัท)
        company_taxid: req.body.company_taxid, //(เลขประจำตัวผู้เสียภาษี)
        company_address: req.body.company_address, //(ที่อยู่บริษัท)
        bank:{
            accountname:req.body.bank.accountname,  //(ชื่อบัญชี)
            accountnumber: req.body.bank.accountnumber, //(เลขบัญชี) 
	          name: req.body.bank.name, //(ชื่อธนาคาร)
            branch: req.body.bank.branch,  //(สาขา) 
            imgbank: partner.bank.imgbank //(รูปภาพบัญชี)
        },
        iden:{ //(บัตรประชาชน)
	        iden_number : req.body.iden.iden_number, //(เลขบัตรประชาชน)
          iden_image : partner.iden.iden_image  //(รูปภาพบัตรประชาชน)
        }
      }

      const edit = await Partner.findByIdAndUpdate(req.params.id,data,{new:true})
      return res.status(200).send({status: true,message: "คุณได้แก้ไขข้อมูลคู่ค้าเรียบร้อย",data: edit});

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//ลบข้อมูล Partner
module.exports.delete = async (req, res) => {
  try {
    const partnerdata = await Partner.findOne({ _id: req.params.id });
    if (!partnerdata) {
      return res.status(200).send({ status: false, message: "ไม่มีข้อมูล admin" });
    }
    const deletepartner = await Partner.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .send({ status: true, message: "ลบข้อมูลสำเร็จ", data: deletepartner });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//เพิ่มรูปภาพบัญชี
module.exports.addimgbank = async (req, res) => {
    try{
        let upload = multer({ storage: storage }).array("image", 20);
        upload(req, res, async function (err) {
            const reqFiles = [];
            const result = [];
            if (err) {
                return res.status(500).send(err);
            }
            const partner = await Partner.findOne({ _id: req.params.id });
            if (!partner) {
                return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
            }else{
                if(partner.bank.imgbank != '')
                {
                    const deleteimg = await deleteFile(partner.bank.imgbank);
                } 
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
            const data = {
                "bank.imgbank": image
            }
            const edit = await Partner.findByIdAndUpdate(req.params.id, data, { new: true })
            return res.status(200).send({ status: true, message: "เพิ่มรูปภาพบัญชีเรียบร้อย", data: edit });
    });
    }catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    
    }
};
//เพิ่มบัตรประชาชน
module.exports.addimgiden = async (req, res) => {
    try{
        let upload = multer({ storage: storage }).array("image", 20);
        upload(req, res, async function (err) {
        const reqFiles = [];
        const result = [];
        if (err) {
            return res.status(500).send(err);
        }
        const partner = await Partner.findOne({ _id: req.params.id });
        if (!partner) {
            return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
        }else{
            if(partner.iden.iden_image != '')
            {
                const deleteimg = await deleteFile(partner.iden.iden_image);
            } 
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
        const data = {
            "iden.iden_image": image
        }
        const edit = await Partner.findByIdAndUpdate(req.params.id, data, { new: true })
        return res.status(200).send({ status: true, message: "เพิ่มบัตรประชาชนเรียบร้อย", data: edit });
    });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }

};


//เปิด -ปิด สถานะ Partner
module.exports.status = async (req, res) => {
  try {
    const partner = await Partner.findOne({ _id: req.params.id });
    if (!partner) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
    }
    const data = {
      partner_status: req.body.partner_status
    }
    const edit = await Partner.findByIdAndUpdate(req.params.id, data, { new: true })
    return res.status(200).send({ status: true, message: "เปลี่ยนสถานะเรียบร้อย", data: edit });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

// ยอมรับ สัญญา Partner ,pdpa
module.exports.status_promiss = async (req, res) => {
    try {
        const partner = await Partner.findOne({ _id: req.params.id });
        if (!partner) {
        return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
        }
        const data = {
          partner_status_promiss: true,
          pdpa : true
        }
        const edit = await Partner.findByIdAndUpdate(req.params.id, data, { new: true })
        return res.status(200).send({ status: true, message: "ยอมรับเรียบร้อย", data: edit });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}
