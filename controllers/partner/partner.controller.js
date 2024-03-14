const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {Partner,validatepartner} = require("../../models/partner/partner.schema");
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

//สร้างไอดี partner (คู่ค้า)
module.exports.add = async (req, res) => {
  try {
    
      //เช็คว่ากรอกข้อมูลครบที่จำเป็นไหม
      const error = validatepartner(req.body);
      if(error.status == false){
        return res.status(400).send({ message: error.details[0].message, status: false });
      }

      //เช็คอีเมล์ซ้ำ
      const checkemail = await Checkalluse.CheckEmail(req.body.email);
      if (checkemail == true) {
        return res.status(409).send({ status: false, message: "email นี้มีคนใช้แล้ว" });
      }

      //เช็คเบอร์โทรศัพท์ซ้ำ
      const checktelephone = await Checkalluse.CheckTelephone(req.body.telephone);
      if (checktelephone == true) {
        return res.status(409).send({ status: false, message: "เบอร์โทรศัพท์ นี้มีคนใช้แล้ว" });
      }

      const data = new Partner({
        email: req.body.email,
        telephone: req.body.telephone,
        password: bcrypt.hashSync(req.body.password, 10),
        name: req.body.name,
        referralcode: await runreferralcode(),//(รหัสผู้แนะนำ)
        address: req.body.address,
        partner_status:false,  //(true: อนุมัติ ,false: ไม่อนุมัติ)
        partner_status_promiss: false, //( true:ยอมรับเงื่อนไข , false: ยังไม่ยอมรับเงื่อนไข)  // สัญญา partner
        pdpa :false, //( true:ยอมรับเงื่อนไข , false: ยังไม่ยอมรับเงื่อนไข) 
        bank:{
            accountname:req.body.bank.accountname,  //(ชื่อบัญชี)
            accountnumber: req.body.bank.accountnumber, //(เลขบัญชี) 
            namebank: req.body.bank.namebank, //(ชื่อธนาคาร)
            branch: req.body.bank.branch,  //(สาขา) 
            imgbank: "" //(รูปภาพบัญชี)
        },
        iden:{ //(บัตรประชาชน)
	        iden_number : req.body.iden.iden_number, //(เลขบัตรประชาชน)
	        iden_image : ""  //(รูปภาพบัตรประชาชน)
        }

      });

      const add = await data.save();
      return res
        .status(200)
        .send({
          status: true,
          message: "คุณได้สร้างไอดี partner เรียบร้อย",
          data: add,
        });

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};


//ดึงข้อมูลทั้งหมด
module.exports.getall = async (req, res) => {
  try {
    const partnerdata = await Partner.find();
    if (!partnerdata) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูลpartner" });
    }
    return res.status(200).send({ status: true, data: partnerdata });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};



//ดึงข้อมูล by id
module.exports.getbyid = async (req, res) => {
  try {
    const partnerdata = await Partner.findOne({ _id: req.params.id });
    if (!partnerdata) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูล partner" });
    }
    return res.status(200).send({ status: true, data: partnerdata });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};



//แก้ไขข้อมูล partner
module.exports.edit = async (req, res) => {
  try {
    const partner = await Partner.findOne({ _id: req.params.id });
    if (!partner) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูล partner" });
    }
    
    //เช็คว่ากรอกข้อมูลครบที่จำเป็นไหม
    const error = validatepartner(req.body);
    if(error.status == false){
      return res.status(400).send({ message: error.details[0].message, status: false });
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
        const checkcompany_taxid = await partner.find({ company_taxid: req.body.company_taxid });
        if (checkcompany_taxid.length !== 0) {
          return res.status(409).send({ status: false, message: "เลขประจำตัวผู้เสียภาษี นี้มีคนใช้แล้ว" });
        }
      }
  
      const data = {
        email: req.body.email,
        telephone: req.body.telephone,
        password:  (req.body.password !=undefined && req.body.password!=''? bcrypt.hashSync(req.body.password, 10):partner.password), // ถ้าไม่ได้มีการส่ง password มาให้ทำการ ใช้ password เดิม
        name: req.body.name,
        address: req.body.address,
        bank:{
            accountname:req.body.bank.accountname,  //(ชื่อบัญชี)
            accountnumber: req.body.bank.accountnumber, //(เลขบัญชี) 
	          namebank: req.body.bank.namebank, //(ชื่อธนาคาร)
            branch: req.body.bank.branch,  //(สาขา) 
            imgbank: partner.bank.imgbank //(รูปภาพบัญชี)
        },
        iden:{ //(บัตรประชาชน)
	        iden_number : req.body.iden.iden_number, //(เลขบัตรประชาชน)
          iden_image : partner.iden.iden_image  //(รูปภาพบัตรประชาชน)
        }
      }

      const edit = await Partner.findByIdAndUpdate(req.params.id,data,{new:true})
      return res.status(200).send({status: true,message: "คุณได้แก้ไขข้อมูล partner เรียบร้อย",data: edit});

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//ลบข้อมูล partner
module.exports.delete = async (req, res) => {
  try {
    const partnerdata = await Partner.findOne({ _id: req.params.id });
    if (!partnerdata) {
      return res.status(200).send({ status: false, message: "ไม่มีข้อมูล partner" });
    }
    const deleteadmin = await Partner.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .send({ status: true, message: "ลบข้อมูลสำเร็จ", data: deleteadmin });
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
                return res.status(404).send({ status: false, message: "ไม่มีข้อมูล partner" });
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
            return res.status(404).send({ status: false, message: "ไม่มีข้อมูล partner" });
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


//เปิด -ปิด สถานะ partner
module.exports.status = async (req, res) => {
  try {
    const partner = await Partner.findOne({ _id: req.params.id });
    if (!partner) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูล partner" });
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

// ยอมรับ สัญญา partner ,pdpa
module.exports.status_promiss = async (req, res) => {
    try {
        const partner = await Partner.findOne({ _id: req.params.id });
        if (!partner) {
        return res.status(404).send({ status: false, message: "ไม่มีข้อมูล partner" });
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


//รันเลขผู้แนะนำ
async function runreferralcode() {

      const startDate = new Date(new Date().setHours(0, 0, 0, 0)); // เริ่มต้นของวันนี้
      const endDate = new Date(new Date().setHours(23, 59, 59, 999)); // สิ้นสุดของวันนี้
      const number = await Partner.find({ createdAt: { $gte: startDate, $lte: endDate } }).countDocuments()
      const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      let referenceNumber = String(number).padStart(5, '0');
      let ref = `partner${currentDate}${referenceNumber}`;
      let loopnum  = 0
      let check = await Partner.find({ referralcode: ref }).countDocuments();
      if (check!== 0) {
        
        do{
          check = await Partner.find({ referralcode: ref }).countDocuments()
          if(check != 0)
          {
            loopnum++;
            referenceNumber = String(number+loopnum).padStart(5, '0');
            ref = `partner${currentDate}${referenceNumber}`;
          }

        }while(check !== 0)

      }
       
      return ref;

      
}
