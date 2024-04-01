const {Order} = require("../../models/order/order.schema");
const {Deliivery} = require("../../models/order/delivery.schema");
const {Product} = require("../../models/product/product.schema");
module.exports.add = async (req, res) => {
    try{

       //เช็คว่ามีข้อมูล customer หริอไม่
        if(req.body.customer_id === undefined || req.body.customer_id ==='')
        {
            return res.status(200).send({ status: false, message: "กรุณากรอก customer_id" })
        }
        //เช็คว่าของพอสั่งหรือเปล่า
       const suborder = req.body.suborder
       suborder.forEach(async (element) => {
         
            element.product.forEach(async (element2) => {
                const product = await Product.findOne({_id:element2.product_id})
                if(product)
                {
                    if(product.product_stock <= element2.qty)
                    {
                        return res.status(200).send({status:false,message:"สินค้า "+product.product_name+" มีไม่พอสั่ง"})
                    }
                }
            })
    
        })
       //ถ้าพอให้หักสต็อกสินค้าเลย
         suborder.forEach(async (element) => {
            element.product.forEach(async (element2) => {
                const product = await Product.findOne({_id:element2.product_id})
                if(product)
                {
                    product.product_stock = product.product_stock - element2.product_qty
                    await product.save()
                }
            })
        })


        const mapsuborder = suborder.map((element) => {
           
            return {
                partner_id:element.partner_id,
                partner_name:element.partner_name,
                partneraddress :{
                    namedelivery:element.partner_name,
                    telephone:element.telephone,
                    address:element.address.address,
                    tambon:element.address.tambon,
                    amphure:element.address.amphure,
                    province:element.address.province,
                    zipcode:element.address.zipcode,
                },//(ที่อยู่ผู้ส่ง)
                status:"กำลังดำเนินการออเดอร์",
                statusdetail:[{status:"กำลังดำเนินการออเดอร์",date:Date.now()}],
                product:element.product,
                totalproduct:element.totalproduct,
                delivery:element.delivery,
                alltotal:element.alltotal,
                delivery_type:"",
                delivery_id:null,
                note:element.note,
            }
        })
        console.log(mapsuborder)
       const addOrder = new Order({
            orderref: await runreferralcode(),
            customer_id:req.body.customer_id,
            address:req.body.address,
            suborder:mapsuborder,
            total:req.body.total,
            totaldelivery:req.body.totaldelivery,
            totaldiscount:req.body.totaldiscount,
            totalmarueycoin:req.body.totalmarueycoin,
            alltotal:req.body.alltotal,
            payment:req.body.payment,
            payment_id:req.body.payment_id
       })

        const saveOrder = await addOrder.save()


        //สร้างใบจัดส่งสินค้า delivery ใหม่
        mapsuborder.forEach(async (element) => {
            const addDelivery = new Deliivery({
                delivery_type:"",
                order_id:saveOrder._id,
                refdelivery:await rundeliverycode(),
                address:saveOrder.address,
                partneraddress:element.partneraddress,
                partner_id:element.partner_id,
                partner_name:element.partner_name,
                tracking:"",
                product:element.product,
                status:"กำลังเตรียมจัดส่ง",
                detail:[{status:"กำลังเตรียมจัดส่ง",date:Date.now()}],
                note:element.note
            })
            await addDelivery.save()    
        })

        return res.status(200).send({status:true,message:"เพิ่มออเดอร์สำเร็จ",data:saveOrder})

    }catch(error){
        return res.status(500).send({status:false,error:error.message});
    }
}

//รันเลขผู้แนะนำ
async function runreferralcode() {

    const startDate = new Date(new Date().setHours(0, 0, 0, 0)); // เริ่มต้นของวันนี้
    const endDate = new Date(new Date().setHours(23, 59, 59, 999)); // สิ้นสุดของวันนี้
    const number = await Order.find({ createdAt: { $gte: startDate, $lte: endDate } }).countDocuments()
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let referenceNumber = String(number).padStart(5, '0');
    let ref = `Order${currentDate}${referenceNumber}`;
    let loopnum  = 0
    let check = await Order.find({ referralcode: ref }).countDocuments();
    if (check!== 0) {
      
      do{
        check = await Order.find({ referralcode: ref }).countDocuments()
        if(check != 0)
        {
          loopnum++;
          referenceNumber = String(number+loopnum).padStart(5, '0');
          ref = `Order${currentDate}${referenceNumber}`;
        }

      }while(check !== 0)

    }
     
    return ref;

    
}


async function rundeliverycode() {

    const startDate = new Date(new Date().setHours(0, 0, 0, 0)); // เริ่มต้นของวันนี้
    const endDate = new Date(new Date().setHours(23, 59, 59, 999)); // สิ้นสุดของวันนี้
    const number = await Deliivery.find({ createdAt: { $gte: startDate, $lte: endDate } }).countDocuments()
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let referenceNumber = String(number).padStart(5, '0');
    let ref = `Delivery${currentDate}${referenceNumber}`;
    let loopnum  = 0
    let check = await Deliivery.find({ referralcode: ref }).countDocuments();
    if (check!== 0) {
      
      do{
        check = await Deliivery.find({ referralcode: ref }).countDocuments()
        if(check != 0)
        {
          loopnum++;
          referenceNumber = String(number+loopnum).padStart(5, '0');
          ref = `Delivery${currentDate}${referenceNumber}`;
        }

      }while(check !== 0)

    }
     
    return ref;

    
}

