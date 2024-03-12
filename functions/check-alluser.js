const {Admin} = require('../models/admin/admin.schema')
const {Dealer} = require('../models/dealer/dealer.schema')
const {Partner} = require('../models/partner/partner.schema')

//สร้าง function เช็คชื่อซ้ำ2 ตาราง

async function CheckEmail(email){
    const checkAdmin = await Admin.findOne({email:email})
    if(checkAdmin) return true
    const checkDealer = await Dealer.findOne({email:email})
    if(checkDealer) return true
    const checkPartner = await Partner.findOne({email:email})
    if(checkPartner) return true    
    return false
}

async function CheckTelephone(telephone){
    const checkAdmin = await Admin.findOne({telephone:telephone})
    if(checkAdmin) return true
    const checkDealer = await Dealer.findOne({telephone:telephone})
    if(checkDealer) return true
    const checkPartner = await Partner.findOne({telephone:telephone})
    if(checkPartner) return true    
    return false
}


const Checkalluse = {
    CheckEmail, CheckTelephone
};
module.exports = Checkalluse