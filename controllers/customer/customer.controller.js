const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Customer, validatecustomer } = require("../../models/customer/customer.schema");
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

//สมัครลูกค้า
module.exports.register = async (req, res) => {
  try{
    const { error } = validatecustomer(req.body);
    if (error) return res.status(400).json({ status:false,message: error.details[0].message });

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

     const data = new Customer({
      email: req.body.email,
      telephone: req.body.telephone,
      password: bcrypt.hashSync(req.body.password, 10),
      referralcode: await runreferralcode() , //(รหัสผู้แนะนำ)
      prefix:req.body.prefix, //(คำนำหน้า)
      name :req.body.name, //(ชื่อ-สกุล)
      sex:req.body.sex, //(เพศ)
     });

    const add = await data.save();
    return res.status(200).json({ status:true,message: "ลงทะเบียนสำเร็จ",data:add});
  }catch(err){
    return res.status(500).json({ status:false,message: err.message });
  }
};

//ดึงข้อมูลลูกค้าทั้งหมด
module.exports.getall = async (req, res) => {
  try{
    const data = await Customer.find();
    return res.status(200).json({ status:true,message: "ดึงข้อมูลสำเร็จ",data:data});
  }catch(err){
    return res.status(500).json({ status:false,message: err.message });
  }
}

//ดึงข้อมูลลูกค้าตาม id
module.exports.getbyid = async (req, res) => {
  try{
    const data = await Customer.findById(req.params.id);
    if (!data) return res.status(404).json({ status:false,message: "ไม่พบข้อมูล"});
    return res.status(200).json({ status:true,message: "ดึงข้อมูลสำเร็จ",data:data});
  }catch(err){
    return res.status(500).json({ status:false,message: err.message });
  }

}
//แก้ไขข้อมูลลูกค้า
module.exports.edit = async (req, res) => {
  try{
    const customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).json({ status:false,message: "ไม่พบข้อมูล"});
    const data ={
      email: req.body.email,
      telephone: req.body.telephone,
      password:(req.body.password !=undefined && req.body.password!=''? bcrypt.hashSync(req.body.password, 10):customer.password),
      prefix:req.body.prefix, //(คำนำหน้า)
      name :req.body.name, //(ชื่อ-สกุล)
      sex:req.body.sex, //(เพศ)
      //
      birthday:req.body.birthday, //(วันเดือนปีเกิด)
      nationality:req.body.nationality, //(สัญชาติ)
      idcard:req.body.idcard, //(เลขบัตรประชาชน)
      facebook: req.body.facebook, //(เฟสบุ๊ค)
      line_id: req.body.line_id, //(ไลน์ไอดี)
      bank:{
          accountname:req.body.bank.accountname, //(ชื่อบัญชี)
          accountnumber:req.body.bank.accountnumber, //(เลขบัญชี) 
          name:req.body.bank.name, //(ชื่อธนาคาร)
          branch:req.body.bank.branch, //(สาขา)
          imgbank:(req.body.bank?.imgbank != undefined && req.body.bank?.imgbank !=''? req.body.bank?.imgbank :customer.bank?.imgbank) //(รูปภาพบัญชี)
      } ,
      address:{
          name:req.body.address.name, //(ชื่อเรียก)
          address:req.body.address.address, //(ที่อยู่)
          province:req.body.address.province, //(จังหวัด)
          amphure:req.body.address.amphure, //(อำเภอ)
          tambon: req.body.address.tambon, //(ตำบล)
          zipcode:req.body.address.zipcode //(รหัสไปรษณีย์)
      },
      addressdelivery:req.body.addressdelivery, //ที่อยู่จัดส่ง
    }
    const edit = await Customer.findByIdAndUpdate(req.params.id,data,{new:true});
    return res.status(200).json({ status:true,message: "แก้ไขข้อมูลสำเร็จ",data:edit});
  }catch(err){
    return res.status(500).json({ status:false,message: err.message });
  }
  
}

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
      const customer = await Customer.findById(req.params.id)
      if (!customer) 
      {
        return res.status(404).json({ status:false,message: "ไม่พบข้อมูล"});
      }else{
        if(customer.bank.imgbank != '')
        {
            const deleteimg = await deleteFile(customer.bank.imgbank);
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
      const edit = await Customer.findByIdAndUpdate(req.params.id,data,{new:true})
      return res.status(200).json({ status:true,message: "เพิ่มรูปภาพบัญชีสำเร็จ",data:edit});
    });
    
  }catch(err){
    return res.status(500).json({ status:false,message: err.message });
  }
}

//ยืนยัน pdpa
module.exports.pdpa = async (req, res) => {
  try{
    const customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).json({ status:false,message: "ไม่พบข้อมูล"});
    const data = {
      pdpa: true
    }
    const edit = await Customer.findByIdAndUpdate(req.params.id,data,{new:true})
    return res.status(200).json({ status:true,message: "ยืนยัน pdpa สำเร็จ",data:edit});
  }catch(err){
    return res.status(500).json({ status:false,message: err.message });
  }
}


//รันเลขผู้แนะนำ
async function runreferralcode() {

  const startDate = new Date(new Date().setHours(0, 0, 0, 0)); // เริ่มต้นของวันนี้
  const endDate = new Date(new Date().setHours(23, 59, 59, 999)); // สิ้นสุดของวันนี้
  const number = await Customer.find({ createdAt: { $gte: startDate, $lte: endDate } }).countDocuments()
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let referenceNumber = String(number).padStart(5, '0');
  let ref = `Customer${currentDate}${referenceNumber}`;
  let loopnum  = 0
  let check = await Customer.find({ referralcode: ref }).countDocuments();
  if (check!== 0) {
    
    do{
      check = await Customer.find({ referralcode: ref }).countDocuments()
      if(check != 0)
      {
        loopnum++;
        referenceNumber = String(number+loopnum).padStart(5, '0');
        ref = `Customer${currentDate}${referenceNumber}`;
      }

    }while(check !== 0)

  }
   
  return ref;

  
}