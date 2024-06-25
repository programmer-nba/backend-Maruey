const {Admin} = require('../models/admin/admin.schema')

const {Partner} = require('../models/partner/partner.schema')
const {Customer} = require('../models/customer/customer.schema')
//สร้าง function เช็คชื่อซ้ำ2 ตาราง

//เช็ค username ซ้ำ
async function CheckUsername(username){
    const checkAdmin = await Admin.findOne({username:username})
    if(checkAdmin) return true
    const checkPartner = await Partner.findOne({username:username})
    if(checkPartner) return true
    const checkCustomer = await Customer.findOne({username:username})
    if(checkCustomer) return true
    return false
}

async function CheckEmail(email){
    const checkAdmin = await Admin.findOne({email:email})
    if(checkAdmin) return true
    const checkPartner = await Partner.findOne({email:email})
    if(checkPartner) return true 
    const checkCustomer = await Customer.findOne({email:email})
    if(checkCustomer) return true
    return false
}

async function CheckTelephone(telephone){
    const checkAdmin = await Admin.findOne({telephone:telephone})
    if(checkAdmin) return true

    const checkPartner = await Partner.findOne({telephone:telephone})
    if(checkPartner) return true    
    const checkCustomer = await Customer.findOne({telephone:telephone})
    if(checkCustomer) return true
    return false
}

//เข็ครหัสผู้แนะนำ ถ้าเจอให้ return true ถ้าไม่เจอ return false
async function CheckRecommendedcode(recommendedcode){
    const checkCustomer = await Customer.findOne({referralcode:recommendedcode})
    if(checkCustomer) return true
    const checkPartner = await Partner.findOne({referralcode:recommendedcode})
    if(checkPartner) return true
    return false
}


const Checkalluse = {
    CheckEmail, CheckTelephone,CheckUsername
};
module.exports = Checkalluse