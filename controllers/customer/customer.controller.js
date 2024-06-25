const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Customer, validatecustomer } = require("../../models/customer/customer.schema");
const {Partner} = require("../../models/partner/partner.schema");
const Checkalluse = require("../../functions/check-alluser");

const { ObjectId } = require('mongodb');
const multer = require("multer");
const {
  uploadFileCreate,
  deleteFile,
} = require("../../functions/uploadfilecreate");
const { object } = require("joi");

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


      //เช็ค username ซ้ำ
      const checkusername = await Checkalluse.CheckUsername(req.body.username);
      if (checkusername == true) {
        return res.status(409).send({ status: false, message: "ชื่อผู้ใช้ นี้มีคนใช้แล้ว" });
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
     let upline = {
      recommendedcode:"",
      level_one: null,
      level_two: null,
      level_three: null,
      level_four: null,
      level_five: null,
      level_six: null,
      level_seven: null,
      level_eight: null,
      level_nine: null,
      level_ten: null,
     }
     if(req.body.recommendedcode != '' && req.body.recommendedcode != undefined)
     {
        //เช็ครหัสผู้แนะนำ
        const checkrecommendedcode = await Customer.findOne({referralcode:req.body.recommendedcode})
        const checkrecommendedcodepartner = await Partner.findOne({referralcode:req.body.recommendedcode})
        if (!checkrecommendedcode && !checkrecommendedcodepartner) {
          return res.status(409).send({ status: false, message: "รหัสผู้แนะนำไม่ถูกต้อง" });
        }else{
          if(checkrecommendedcode)
          {
            upline = {
              recommendedcode:req.body.recommendedcode,
              level_one: checkrecommendedcode._id,
              level_two: checkrecommendedcode.upline.level_one,
              level_three: checkrecommendedcode.upline.level_two,
              level_four: checkrecommendedcode.upline.level_three,
              level_five: checkrecommendedcode.upline.level_four,
              level_six: checkrecommendedcode.upline.level_five,
              level_seven: checkrecommendedcode.upline.level_six,
              level_eight: checkrecommendedcode.upline.level_seven,
              level_nine: checkrecommendedcode.upline.level_eight,
              level_ten: checkrecommendedcode.upline.level_nine,
            }
          }else if(checkrecommendedcodepartner){
            upline = {
              recommendedcode:req.body.recommendedcode,
              level_one: checkrecommendedcodepartner._id,
              level_two: null,
              level_three: null,
              level_four: null,
              level_five: null,
              level_six: null,
              level_seven: null,
              level_eight: null,
              level_nine: null,
              level_ten: null,
            }
          }
          
        }
     }

     const data = new Customer({
      username: req.body.username,
      email: req.body.email,
      telephone: req.body.telephone,
      password: bcrypt.hashSync(req.body.password, 10),
      referralcode: await runreferralcode() , //(รหัสผู้แนะนำ)
      prefix:req.body.prefix, //(คำนำหน้า)
      name :req.body.name, //(ชื่อ-สกุล)
      sex:req.body.sex, //(เพศ)
      upline:upline,
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
    //เช็ค username ซ้ำ
    if(req.body.username != customer.username)
    {
        const checkusername = await Checkalluse.CheckUsername(req.body.username);
        if (checkusername == true) {
          return res.status(409).send({ status: false, message: "ชื่อผู้ใช้ นี้มีคนใช้แล้ว" });
        }
    }
    //เช็ค email ซ้ำ
    if(req.body.email != customer.email)
    {
        const checkemail = await Checkalluse.CheckEmail(req.body.email);
        if (checkemail == true) {
          return res.status(409).send({ status: false, message: "email นี้มีคนใช้แล้ว" });
        }
    }
    //เช็ค telephone ซ้ำ
    if(req.body.telephone != customer.telephone)
    {
        const checktelephone = await Checkalluse.CheckTelephone(req.body.telephone);
        if (checktelephone == true) {
          return res.status(409).send({ status: false, message: "เบอร์โทรศัพท์ นี้มีคนใช้แล้ว" });
        }
    }

    const data ={
      username: req.body.username,
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

  //เช็คเลขแนะนำ referralcode ว่ามีอยู่ไหม ถ้ามี returm ไปว่ามี ถ้าไม่มี return ไปว่าไม่มี
  module.exports.CheckRecommendedcode = async (req, res) => {
    try{
      const checkrecommendedcode = await Customer.findOne({referralcode:req.params.id})
      const checkrecommendedcodepartner = await Partner.findOne({referralcode:req.params.id})
      if (!checkrecommendedcode && !checkrecommendedcodepartner) {
        return res.status(200).json({ status:false,message: "ไม่พบข้อมูล"});
      }
      return res.status(200).json({ status:true,message: "พบข้อมูล"});
    }
    catch(err){
      return res.status(500).json({ status:false,message: err.message });
    }
  }

   //เพิ่มที่อยู่จัดส่ง
  module.exports.addnewaddressdelivery = async (req, res) => {
    try{
      const customer = await Customer.findById(req.params.id)
      if (!customer) return res.status(404).json({ status:false,message: "ไม่พบข้อมูล"});
      
      
      customer.addressdelivery.push(req.body.addressdelivery) 
      
      const edit = await Customer.findByIdAndUpdate(req.params.id,{"addressdelivery":customer.addressdelivery},{new:true})
      return res.status(200).json({ status:true,message: "เพิ่มที่อยู่จัดส่งสำเร็จ",data:edit});
    }catch(err){
      return res.status(500).json({ status:false,message: err.message });
    }
  }

  //แก้ไขที่อยู่จัดส่ง
  module.exports.editaddressdelivery = async (req, res) => {
    try{
      const customer = await Customer.findById(req.params.id)
      if (!customer) return res.status(404).json({ status:false,message: "ไม่พบข้อมูล"});
      const findindex =  customer.addressdelivery.findIndex(x=>x._id == req.body.addressdelivery._id)
      if(findindex == -1)
      {
        return res.status(404).json({ status:false,message: "ไม่พบข้อมูล"});
      }else{
        customer.addressdelivery[findindex] = req.body.addressdelivery
        const edit = await Customer.findByIdAndUpdate(req.params.id,{"addressdelivery":customer.addressdelivery},{new:true})
        return res.status(200).json({ status:true,message: "แก้ไขที่อยู่จัดส่งสำเร็จ",data:edit});         
      }

    }catch(err){
      return res.status(500).json({ status:false,message: err.message });
    }
  
}

module.exports.test = async (req, res) => {
  try{
    const upline ={
      recommendedcode:"Customer2024040600009",
      level_one: new ObjectId("6610d1646fcab2c7d19352b0"),
      level_two: new ObjectId("6610d1246fcab2c7d1935286"),
      level_three: new ObjectId("6610d0e06fcab2c7d1935268"),
      level_four: new ObjectId("6610d0996fcab2c7d193523e"),
      level_five: new ObjectId("6610d0606fcab2c7d1935220"),
      level_six: new ObjectId("66610d0266fcab2c7d19351f6"),
      level_seven: new ObjectId("6610cfd76fcab2c7d19351cc"),
      level_eight: new ObjectId("6610cf946fcab2c7d19351a1"),
      level_nine: new ObjectId("6610cf526fcab2c7d1935176"),
      level_ten: new ObjectId("6610cefc3088cd8615733bc9"),
    };

    
    const data = await Customer.findByIdAndUpdate("65fe40cb571f3592f27398b9",{upline:upline})
 
    return res.status(200).json({ status:true,message: "ดึงข้อมูลสำเร็จ",data:data});

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