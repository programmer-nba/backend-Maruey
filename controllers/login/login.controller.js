const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const {Admin, validateadmin} = require("../../models/admin/admin.schema");
const {Partner, validatePartner} = require("../../models/partner/partner.schema");
const {Customer, validateCustomer} = require("../../models/customer/customer.schema");
////ล็อค หลังบ้าน (admin,partner,partner)
module.exports.login = async (req, res) => {
    try {
        if(req.body.emailandtelephone === undefined || req.body.emailandtelephone ==='')
        {
            return res.status(200).send({ status: false, message: "กรุณากรอกอีเมล์ หรือ เบอร์โทรศัพท์" })
        }
        if(req.body.password === undefined || req.body.password ==='')
        {
            return res.status(200).send({ status: false, message: "กรุณากรอก password" })
        }
        const emailandtelephone = req.body.emailandtelephone
        const password = req.body.password
        
        //เช็คว่า user นี้มีในระบบไหม
        const admin = await Admin.findOne({$or: [{ email: emailandtelephone },{ telephone: emailandtelephone }]})
        const partner = await Partner.findOne({$or: [{ email: emailandtelephone },{ telephone: emailandtelephone }]})
        const customer = await Customer.findOne({$or: [{ email: emailandtelephone },{ telephone: emailandtelephone }]})

        let bcryptpassword
       
        if(admin)
        {
            bcryptpassword = await bcrypt.compare(password,admin.password)
            if(bcryptpassword)
            {
                const payload = {
                    _id:admin._id,
                    email:admin.email,
                    telephone:admin.telephone,
                    name : admin.name,
                    row:"admin",
                    position:admin.position
                }
                const secretKey = process.env.SECRET_KEY
                const token = jwt.sign(payload,secretKey,{expiresIn:"10D"})
                return res.status(200).send({ status: true, data: payload, token: token})
            }else{
                return res.status(200).send({ status: false, message: "คุณกรอกรหัสไม่ถูกต้อง" })
            }
        }else if (partner)
        {
            bcryptpassword = await bcrypt.compare(password,partner.password)
            if(bcryptpassword)
            {
                const payload = {
                    _id:partner._id,
                    email:partner.email,
                    telephone:partner.telephone,
                    name : partner.name,
                    row:"partner",
                    partner_status:partner.partner_status,
                    partner_promiss:partner.partner_status_promiss,
                    pdpa:partner.pdpa
                }
                const secretKey = process.env.SECRET_KEY
                const token = jwt.sign(payload,secretKey,{expiresIn:"10D"})
                return res.status(200).send({ status: true, data: payload, token: token})
            }else{
                return res.status(200).send({ status: false, message: "คุณกรอกรหัสไม่ถูกต้อง" })
            }
        }else if(customer){
            bcryptpassword = await bcrypt.compare(password,customer.password)
            if(bcryptpassword)
            {
                const payload = {
                    _id:customer._id,
                    email:customer.email,
                    telephone:customer.telephone,
                    name : customer.name,
                    row:"customer",
                
                }
                const secretKey = process.env.SECRET_KEY
                const token = jwt.sign(payload,secretKey,{expiresIn:"10D"})
                return res.status(200).send({ status: true, data: payload, token: token})
            }else{
                return res.status(200).send({ status: false, message: "คุณกรอกรหัสไม่ถูกต้อง" })
            }
        }else{
            return res.status(404).send({ status: false, message: "ไม่มีไอดีนี้อยู่ในระบบ" })
        }


      } catch (error) {
        return res.status(500).send({status:false,error:error.message});
      } 
}
// get me
module.exports.getme = async (req,res) =>{
    try {  

        let token = req.headers['token'];

        if(!token){
            return res.status(403).send({status:false,message:'Not authorized'});
        }
        const secretKey = "i#ngikanei;#aooldkhfa'"
        //เช็ค if ว่า 6ตัวแรก มีคำว่า Bearer ไหม
        if (token.startsWith("Bearer ")) {
            token = token.replace(/^Bearer\s+/, "");
            // ทำการยืนยันสิทธิ์ token
            const decodded =jwt.verify(token,secretKey)
            const dataResponse ={
            _id:decodded._id,
            email:decodded.email,
            telephone:decodded.telephone,
            name:decodded.name,
            row:decodded.row,
            position:decodded.position
            }
        return res.status(200).send({status:true,data:dataResponse});
        }else{
            return res.status(403).send({status:false,message:'token ไม่ถูกต้องตามรบบ '})
        }

        
    } catch (error) {
          console.log(error);
          return res.status(500).send({status:false,error:error.message});
    }
}


//gen token เอาไว้ใช้ด้านนอก
module.exports.gentoken = async (req,res) =>{
    try {
        const payload = {
            _id:"0",
            email:"marueypublic",
            telephone:"0000000000",
            name : "marueypublic",
            row:"public",
            position:"public"
        }
        const secretKey = process.env.SECRET_KEY
        const token = jwt.sign(payload,secretKey)
        return res.status(200).send({ status: true, data: payload, token: token})
    }
    catch (error) {
        return res.status(500).send({status:false,error:error.message});
    }
}