const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin ,validateadmin }= require("../../models/admin/admin.schema");
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

//สร้างไอดี admin
module.exports.add = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).array("image", 20);
    upload(req, res, async function (err) {
      const reqFiles = [];
      const result = [];
      if (err) {
        return res.status(500).send(err);
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

      //เช็คว่ากรอกข้อมูลครบที่จำเป็นไหม
      const error = validateadmin(req.body);
      if(error.status == false){
        return res.status(400).send({ message: error.details[0].message, status: false });
      }
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

      const data = new Admin({
        username: req.body.username,
        email: req.body.email,
        telephone: req.body.telephone,
        password: bcrypt.hashSync(req.body.password, 10),
        name: req.body.name,
        position: req.body.position,
      });

      
      const add = await data.save();
      return res
        .status(200)
        .send({
          status: true,
          message: "คุณได้สร้างไอดี admin เรียบร้อย",
          data: add,
        });
    });
    ////
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};


//ดึงข้อมูลทั้งหมด
module.exports.getall = async (req, res) => {
  try {
    const admindata = await Admin.find();
    if (!admindata) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูล admin" });
    }
    return res.status(200).send({ status: true, data: admindata });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};



//ดึงข้อมูล by id
module.exports.getbyid = async (req, res) => {
  try {
    const admindata = await Admin.findOne({ _id: req.params.id });
    if (!admindata) {
      return res.status(404).send({ status: false, message: "ไม่มีข้อมูล admin" });
    }
    return res.status(200).send({ status: true, data: admindata });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//แก้ไขข้อมูล Admin
module.exports.edit = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).array("image", 20);
    upload(req, res, async function (err) {
      const reqFiles = [];
      const result = [];
      if (err) {
        return res.status(500).send(err);
      }
      //เช็คว่ามี id นี้ไหม
      const admin = await Admin.findOne({ _id: req.params.id });
      if (!admin) {
        return res.status(404).send({ status: false, message: "ไม่มีข้อมูล admin" });
      }
      let image = '' // ตั้งตัวแปรรูป
      
       //เช็คว่ากรอกข้อมูลครบที่จำเป็นไหม
       const error = validateadmin(req.body);
       if(error.status == false){
         return res.status(400).send({ message: error.details[0].message, status: false });
       }
     
      //ถ้ามีรูปให้ทำฟังก์ชั่นนี้ก่อน
      if (req.files) {
        const url = req.protocol + "://" + req.get("host");
        for (var i = 0; i < req.files.length; i++) {
          const src = await uploadFileCreate(req.files, res, { i, reqFiles });
          result.push(src);
          //   reqFiles.push(url + "/public/" + req.files[i].filename);
        }

        //ไฟล์รูป
        image = reqFiles[0]
      }
      //เช็ค username ซ้ำ
      if(admin.username != req.body.username)
      {
        const checkusername = await Checkalluse.CheckUsername(req.body.username);
        if (checkusername == true) {
          return res.status(409).send({ status: false, message: "ชื่อผู้ใช้ นี้มีคนใช้แล้ว" });
        }
      }

      if(admin.email != req.body.email)
      {
        const checkemail = await Checkalluse.CheckEmail(req.body.email);
        if (checkemail == true) {
          return res.status(409).send({ status: false, message: "email นี้มีคนใช้แล้ว" });
        }
      }  

      if(admin.telephone != req.body.telephone)
      {
        const checktelephone = await Checkalluse.CheckTelephone(req.body.telephone);
        if (checktelephone == true) {
          return res.status(409).send({ status: false, message: "เบอร์โทรศัพท์ นี้มีคนใช้แล้ว" });
        }
      }
          
      const data = {
        username: req.body.username,
        email: req.body.email,
        telephone: req.body.telephone,
        password:  (req.body.password !=undefined && req.body.password!=''? bcrypt.hashSync(req.body.password, 10):admin.password), // ถ้าไม่ได้มีการส่ง password มาให้ทำการ ใช้ password เดิม
        name: req.body.name,
        position: req.body.position,
      }

      const edit = await Admin.findByIdAndUpdate(req.params.id,data,{new:true})
      return res.status(200).send({status: true,message: "คุณได้แก้ไขข้อมูล admin เรียบร้อย",data: edit});
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//ลบข้อมูล Admin
module.exports.delete = async (req, res) => {
  try {
    const admindata = await Admin.findOne({ _id: req.params.id });
    if (!admindata) {
      return res.status(200).send({ status: false, message: "ไม่มีข้อมูล admin" });
    }
    const deleteadmin = await Admin.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .send({ status: true, message: "ลบข้อมูลสำเร็จ", data: deleteadmin });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

