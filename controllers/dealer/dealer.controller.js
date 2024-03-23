const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Dealer ,validatedealer }= require("../../models/dealer/dealer.schema");
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

//สร้างไอดี dealer (คู่ค้า)
module.exports.add = async (req, res) => {
  try {
    
      //เช็คว่ากรอกข้อมูลครบที่จำเป็นไหม
      const error = validatedealer(req.body);
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

      //เช็คว่าเลขบัตรประจำตัวผู้เสียภาษีซ้ำไหม
      const checkcompany_taxid = await Dealer.find({ company_taxid: req.body.company_taxid });
      if (checkcompany_taxid.length !== 0) {
        return res.status(409).send({ status: false, message: "เลขประจำตัวผู้เสียภาษี นี้มีคนใช้แล้ว" });
      }



      const data = new Dealer({
        email: req.body.email,
        telephone: req.body.telephone,
        password: bcrypt.hashSync(req.body.password, 10),
        name: req.body.name,
        referralcode: await runreferralcode(),//(รหัสผู้แนะนำ)
        address: req.body.address,
        company_name: req.body.company_name, //(ชื่อบริษัท)
        company_taxid: req.body.company_taxid, //(เลขประจำตัวผู้เสียภาษี)
        company_address: req.body.company_address, //(ที่อยู่บริษัท)
        dealer_status:false,  //(true: อนุมัติ ,false: ไม่อนุมัติ)
        dealer_status_promiss: false, //( true:ยอมรับเงื่อนไข , false: ยังไม่ยอมรับเงื่อนไข)  // สัญญา dealer
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
          message: "คุณได้สร้างไอดี dealer เรียบร้อย",
          data: add,
        });

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};


//ดึงข้อมูลทั้งหมด
module.exports.getall = async (req, res) => {
  try {
    const dealerdata = await Dealer.find();
    if (!dealerdata) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
    }
    return res.status(200).send({ status: true, data: dealerdata });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};



//ดึงข้อมูล by id
module.exports.getbyid = async (req, res) => {
  try {
    const dealerdata = await Dealer.findOne({ _id: req.params.id });
    if (!dealerdata) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
    }
    return res.status(200).send({ status: true, data: dealerdata });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};



//แก้ไขข้อมูล dealer
module.exports.edit = async (req, res) => {
  try {
    const dealer = await Dealer.findOne({ _id: req.params.id });
    if (!dealer) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
    }
    
    //เช็คว่ากรอกข้อมูลครบที่จำเป็นไหม
    const error = validatedealer(req.body);
    if(error.status == false){
      return res.status(400).send({ message: error.details[0].message, status: false });
    }


      if(dealer.email != req.body.email)
      {
        const checkemail = await Checkalluse.CheckEmail(req.body.email);
        if (checkemail == true) {
          return res.status(409).send({ status: false, message: "email นี้มีคนใช้แล้ว" });
        }
      }  

      if(dealer.telephone != req.body.telephone)
      {
        const checktelephone = await Checkalluse.CheckTelephone(req.body.telephone);
        if (checktelephone == true) {
          return res.status(409).send({ status: false, message: "เบอร์โทรศัพท์ นี้มีคนใช้แล้ว" });
        }
      }

      if(dealer.company_taxid != req.body.company_taxid)
      {
        //เช็คว่าเลขบัตรประจำตัวผู้เสียภาษีซ้ำไหม
        const checkcompany_taxid = await Dealer.find({ company_taxid: req.body.company_taxid });
        if (checkcompany_taxid.length !== 0) {
          return res.status(409).send({ status: false, message: "เลขประจำตัวผู้เสียภาษี นี้มีคนใช้แล้ว" });
        }
      }
  
      const data = {
        email: req.body.email,
        telephone: req.body.telephone,
        password:  (req.body.password !=undefined && req.body.password!=''? bcrypt.hashSync(req.body.password, 10):dealer.password), // ถ้าไม่ได้มีการส่ง password มาให้ทำการ ใช้ password เดิม
        name: req.body.name,
        address: req.body.address,
        company_name: req.body.company_name, //(ชื่อบริษัท)
        company_taxid: req.body.company_taxid, //(เลขประจำตัวผู้เสียภาษี)
        company_address: req.body.company_address, //(ที่อยู่บริษัท)
        bank:{
            accountname:req.body.bank.accountname,  //(ชื่อบัญชี)
            accountnumber: req.body.bank.accountnumber, //(เลขบัญชี) 
	          namebank: req.body.bank.namebank, //(ชื่อธนาคาร)
            branch: req.body.bank.branch,  //(สาขา) 
            imgbank: dealer.bank.imgbank //(รูปภาพบัญชี)
        },
        iden:{ //(บัตรประชาชน)
	        iden_number : req.body.iden.iden_number, //(เลขบัตรประชาชน)
          iden_image : dealer.iden.iden_image  //(รูปภาพบัตรประชาชน)
        }
      }

      const edit = await Dealer.findByIdAndUpdate(req.params.id,data,{new:true})
      return res.status(200).send({status: true,message: "คุณได้แก้ไขข้อมูลคู่ค้าเรียบร้อย",data: edit});

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//ลบข้อมูล dealer
module.exports.delete = async (req, res) => {
  try {
    const dealerdata = await Dealer.findOne({ _id: req.params.id });
    if (!dealerdata) {
      return res.status(200).send({ status: false, message: "ไม่มีข้อมูล admin" });
    }
    const deleteadmin = await Dealer.findByIdAndDelete(req.params.id);
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
            const dealer = await Dealer.findOne({ _id: req.params.id });
            if (!dealer) {
                return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
            }else{
                if(dealer.bank.imgbank != '')
                {
                    const deleteimg = await deleteFile(dealer.bank.imgbank);
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
            const edit = await Dealer.findByIdAndUpdate(req.params.id, data, { new: true })
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
        const dealer = await Dealer.findOne({ _id: req.params.id });
        if (!dealer) {
            return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
        }else{
            if(dealer.iden.iden_image != '')
            {
                const deleteimg = await deleteFile(dealer.iden.iden_image);
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
        const edit = await Dealer.findByIdAndUpdate(req.params.id, data, { new: true })
        return res.status(200).send({ status: true, message: "เพิ่มบัตรประชาชนเรียบร้อย", data: edit });
    });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }

};


//เปิด -ปิด สถานะ dealer
module.exports.status = async (req, res) => {
  try {
    const dealer = await Dealer.findOne({ _id: req.params.id });
    if (!dealer) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
    }
    const data = {
      dealer_status: req.body.dealer_status
    }
    const edit = await Dealer.findByIdAndUpdate(req.params.id, data, { new: true })
    return res.status(200).send({ status: true, message: "เปลี่ยนสถานะเรียบร้อย", data: edit });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

// ยอมรับ สัญญา dealer ,pdpa
module.exports.status_promiss = async (req, res) => {
    try {
        const dealer = await Dealer.findOne({ _id: req.params.id });
        if (!dealer) {
        return res.status(404).send({ status: false, message: "ไม่มีข้อมูลคู่ค้า" });
        }
        const data = {
        dealer_status_promiss: true,
        pdpa : true
        }
        const edit = await Dealer.findByIdAndUpdate(req.params.id, data, { new: true })
        return res.status(200).send({ status: true, message: "ยอมรับเรียบร้อย", data: edit });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}


//รันเลขผู้แนะนำ
async function runreferralcode() {

      const startDate = new Date(new Date().setHours(0, 0, 0, 0)); // เริ่มต้นของวันนี้
      const endDate = new Date(new Date().setHours(23, 59, 59, 999)); // สิ้นสุดของวันนี้
      const number = await Dealer.find({ createdAt: { $gte: startDate, $lte: endDate } }).countDocuments()
      const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      let referenceNumber = String(number).padStart(5, '0');
      let ref = `Dealer${currentDate}${referenceNumber}`;
      let loopnum  = 0
      let check = await Dealer.find({ referralcode: ref }).countDocuments();
      if (check!== 0) {
        
        do{
          check = await Dealer.find({ referralcode: ref }).countDocuments()
          if(check != 0)
          {
            loopnum++;
            referenceNumber = String(number+loopnum).padStart(5, '0');
            ref = `Dealer${currentDate}${referenceNumber}`;
          }

        }while(check !== 0)

      }
       
      return ref;

      
}
