const {Shareincome} = require('../../models/shareincome/shareincome.schema');

//ดึงข้อมูลรายได้จากการแชร์ลิ้งค์สินค้าทั้งหมด
module.exports.getShareincome = async (req, res) => {
    try {
        const shareincome = await Shareincome.find().populate('order_id').populate('delivery_id').populate('partner.partner_id')
        return res.status(200).json({status: true, data: shareincome});
    } catch (error) {
        res.status(500).json(error.message);
    }
}