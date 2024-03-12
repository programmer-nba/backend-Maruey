const jwt = require('jsonwebtoken');

const admin = async(req, res, next)=>{
    try{

        let token = req.headers["token"]
        //เช็ค token
        if(token == "" || token == null || token == undefined){
            return res.status(403).send({status:false,message:'กรุณากรอก token'});
        }
        const secretKey = "i#ngikanei;#aooldkhfa'"
        //เช็ค if ว่า 6ตัวแรก มีคำว่า Bearer ไหม
        if (token.startsWith("Bearer ")) {
            token = token.replace(/^Bearer\s+/, "");
            // ทำการยืนยันสิทธิ์ token
            const decoded =  jwt.verify(token,secretKey)
            if(decoded.row ==="admin"){
                req.users = decoded.data
                next();
            }else{
                return res.status(400).send({status:false,message:"คุณไม่มีสิทธิ่ในการใช้งาน"})
            }
        }else{
            return res.status(403).send({status:false,message:'token ไม่ถูกต้องตามรบบ '})
        }
        
    }catch (err){
        return res.status(500).send({error:err.message})
    }
}
const dealer = async(req, res, next)=>{
    try{

        let token = req.headers["token"]
        //เช็ค token
        if(token == "" || token == null || token == undefined){
            return res.status(403).send({status:false,message:'กรุณากรอก token'});
        }
        const secretKey = "i#ngikanei;#aooldkhfa'"
        //เช็ค if ว่า 6ตัวแรก มีคำว่า Bearer ไหม
        if (token.startsWith("Bearer ")) {
            token = token.replace(/^Bearer\s+/, "");
            // ทำการยืนยันสิทธิ์ token
            const decoded =  jwt.verify(token,secretKey)
            if(decoded.row ==="dealer"){
                req.users = decoded.data
                next();
            }else{
                return res.status(400).send({status:false,message:"คุณไม่มีสิทธิ่ในการใช้งาน"})
            }
        }else{
            return res.status(403).send({status:false,message:'token ไม่ถูกต้องตามรบบ '})
        }
        
    }catch (err){
        return res.status(500).send({error:err.message})
    }
}

const adminanddealer = async(req, res, next)=>{
    try{

        let token = req.headers["token"]
        //เช็ค token
        if(token == "" || token == null || token == undefined){
            return res.status(403).send({status:false,message:'กรุณากรอก token'});
        }
        const secretKey = "i#ngikanei;#aooldkhfa'"
        //เช็ค if ว่า 6ตัวแรก มีคำว่า Bearer ไหม
        if (token.startsWith("Bearer ")) {
            token = token.replace(/^Bearer\s+/, "");
            // ทำการยืนยันสิทธิ์ token
            const decoded =  jwt.verify(token,secretKey)
            if(decoded.row ==="admin" || decoded.row ==="dealer"){
                req.users = decoded.data
                next();
            }else{
                return res.status(400).send({status:false,message:"คุณไม่มีสิทธิ่ในการใช้งาน"})
            }
        }else{
            return res.status(403).send({status:false,message:'token ไม่ถูกต้องตามรบบ '})
        }
        
    }catch (err){
        return res.status(500).send({error:err.message})
    }

}

const partner = async(req, res, next)=>{
    try{

        let token = req.headers["token"]
        //เช็ค token
        if(token == "" || token == null || token == undefined){
            return res.status(403).send({status:false,message:'กรุณากรอก token'});
        }
        const secretKey = "i#ngikanei;#aooldkhfa'"
        //เช็ค if ว่า 6ตัวแรก มีคำว่า Bearer ไหม
        if (token.startsWith("Bearer ")) {
            token = token.replace(/^Bearer\s+/, "");
            // ทำการยืนยันสิทธิ์ token
            const decoded =  jwt.verify(token,secretKey)
            if(decoded.row ==="partner"){
                req.users = decoded.data
                next();
            }else{
                return res.status(400).send({status:false,message:"คุณไม่มีสิทธิ่ในการใช้งาน"})
            }
        }else{
            return res.status(403).send({status:false,message:'token ไม่ถูกต้องตามรบบ '})
        }
        
    }catch (err){
        return res.status(500).send({error:err.message})
    }

}

const adminandpartner = async(req, res, next)=>{
    try{

        let token = req.headers["token"]
        //เช็ค token
        if(token == "" || token == null || token == undefined){
            return res.status(403).send({status:false,message:'กรุณากรอก token'});
        }
        const secretKey = "i#ngikanei;#aooldkhfa'"
        //เช็ค if ว่า 6ตัวแรก มีคำว่า Bearer ไหม
        if (token.startsWith("Bearer ")) {
            token = token.replace(/^Bearer\s+/, "");
            // ทำการยืนยันสิทธิ์ token
            const decoded =  jwt.verify(token,secretKey)
            if(decoded.row ==="admin" || decoded.row ==="partner"){
                req.users = decoded.data
                next();
            }else{
                return res.status(400).send({status:false,message:"คุณไม่มีสิทธิ่ในการใช้งาน"})
            }
        }else{
            return res.status(403).send({status:false,message:'token ไม่ถูกต้องตามรบบ '})
        }
        
    }catch (err){
        return res.status(500).send({error:err.message})
    }


}


const all = async (req,res,next) => {
    try{
        let token = req.headers["token"]
        //เช็ค token
         if(token == "" || token == null || token == undefined){
            return res.status(403).send({status:false,message:'กรุณากรอก token'});
        }
        const secretKey = "i#ngikanei;#aooldkhfa'"
        //เช็ค if ว่า 6ตัวแรก มีคำว่า Bearer ไหม
        if (token.startsWith("Bearer ")) {
            token = token.replace(/^Bearer\s+/, "");
            // ทำการยืนยันสิทธิ์ token
                const decoded =  jwt.verify(token,secretKey)
                req.users = decoded.data
                next()    
        }else{
            return res.status(403).send({status:false,message:'token ไม่ถูกต้องตามระบบ '})
        }     
    }catch (err){
        return res.status(500).send({error:err.message})
    }
}
const authuser = {
    admin,
    dealer,
    adminanddealer,
    partner,
    adminandpartner,
    all
};

module.exports = authuser;