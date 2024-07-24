const {Order} = require("../../models/order/order.schema");
const {Deliivery} = require("../../models/order/delivery.schema");
const {Product} = require("../../models/product/product.schema");
const {Information} = require("../../models/information/information.schema");   
module.exports.add = async (req, res) => {
    try{

       //เช็คว่ามีข้อมูล customer หริอไม่
        if(!req.body.customer_id)
        {
            return res.status(200).send({ status: false, message: "กรุณากรอก customer_id" })
        }
        //เช็คว่าของพอสั่งหรือเปล่า
       const suborder = req.body.suborder
       /* suborder.forEach(async (element) => {
         
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
    
        }) */
       //ถ้าพอให้หักสต็อกสินค้าเลย
         /* suborder.forEach(async (element) => {
            element.product.forEach(async (element2) => {
                const product = await Product.findOne({_id:element2.product_id})
                if(product)
                {
                    product.product_stock = product.product_stock - element2.product_qty
                    await product.save()
                }
            })
        }) */

        const marueyinformation = await Information.findOne();

        const mapsuborder = suborder.map((element) => {
            if(!element.partner_id)
            {
                return {
                    partner_id:element.partner_id,
                    partner_name:element.partner_name,
                    partneraddress :{
                        namedelivery:marueyinformation.namedelivery,
                        telephone:marueyinformation.telephone,
                        address:marueyinformation.address,
                        tambon:marueyinformation.tambon,
                        amphure:marueyinformation.amphure,
                        province:marueyinformation.province,
                        zipcode:marueyinformation.zipcode,
                    },//(ที่อยู่ผู้ส่ง)
                    
                    statusdetail:[{status:"กำลังดำเนินการ",date:Date.now()}],
                    product:element.product,
                    totalproduct:element.totalproduct,
                    delivery:element.delivery,
                    alltotal:element.alltotal,
                    delivery_type:element.delivery_type,
                    delivery_id:element.delivery_id,
                    note:element.note,
                }
            }
            else{
                return {
                    partner_id:element.partner_id,
                    partner_name:element.partner_name,
                    partneraddress :{
                        namedelivery:req.body.partner_name,
                        telephone:req.body.telephone,
                        address:req.body.address.address,
                        tambon:req.body.address.tambon,
                        amphure:req.body.address.amphure,
                        province:req.body.address.province,
                        zipcode:req.body.address.zipcode,
                    },//(ที่อยู่ผู้ส่ง)
                    status:"กำลังดำเนินการ",
                    statusdetail:[{status:"กำลังดำเนินการ",date:Date.now()}],
                    product:element.product,
                    totalproduct:element.totalproduct,
                    delivery:element.delivery,
                    alltotal:element.alltotal,
                    delivery_type:element.delivery_type,
                    delivery_id:element.delivery_id,
                    note:element.note,
                }
            }
            
        })
     
       const addOrder = new Order({
            orderref: await runreferralcode(),
            customer_id:req.body.customer_id,
            address:req.body.address,
            status:"กำลังดำเนินการ",
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
                customer_id:req.body.customer_id,
                refdelivery:await rundeliverycode(),
                address:saveOrder.address,
                partneraddress:element.partneraddress,
                partner_id:element.partner_id,
                partner_name:element.partner_name,
                tracking:"",
                product:element.product,
                totalproduct:element.totalproduct,
                delivery:element.delivery,
                alltotal:element.alltotal,
                status:"รอยืนยัน",
                detail:[{status:"รอยืนยัน",date:Date.now()}],
                note:element.note
            })
            const adds = await addDelivery.save()
            const order = await Order.findOne({_id:saveOrder._id})
            order.suborder.forEach(async (element2) => {
                
                if(element2.partner_id?.toString() == element.partner_id?.toString()) {
                    element2.delivery_id = adds._id
                    // element2.delivery_type = adds.delivery_type
                }
            })    
            await order.save()
        })

        return res.status(200).send({status:true,message:"เพิ่มออเดอร์สำเร็จ",data:saveOrder})

    }catch(error){
        console.log(error.message)
        return res.status(500).send({status:false,error:error.message});
    }
}

module.exports.get = async (req, res) => {
    try{
        const order = await Order.find().populate('customer_id').populate('suborder.delivery_id')
        return res.status(200).send({status:true,data:order})
    }catch(error){
        return res.status(500).send({status:false,error:error.message});
    }
}

module.exports.getbyid = async (req, res) => {
    try{
        const order = await Order.findOne({_id:req.params.id}).populate('customer_id').populate('suborder.delivery_id')
        return res.status(200).send({status:true,data:order})
    }catch(error){
        return res.status(500).send({status:false,error:error.message});
    }

}


module.exports.test = async (req, res) => {
    try{
      
        return res.status(200).send({status:true,data:"สวัสดีครับ 5 โมง 40 นาที"})
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

