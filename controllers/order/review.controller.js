const {Review} = require('../../models/order/review.schema');
const {Deliivery} = require('../../models/order/delivery.schema');
const { Product } = require('../../models/product/product.schema');

// เพิ่มรีวิว
module.exports.add = async (req, res) => {
    try {
      
        const deliivery = await Deliivery.findById(req.body.deliivery_id);
        if(!deliivery) return res.status(404).send({status:false,message:"Delivery not found"});
        const product = deliivery.product.map((item)=>{
           return {product_id:item.product_id} 
        });

        const data = new Review({
            ...req.body,
        
            product:product
        });
        const add =  await data.save();
        //ค้นหาตาม product ใน array ของ Review
        const review = await Review.find({product:{$elemMatch:{product_id:{$in:product.map((item)=>item.product_id)}}}});
     
        //หาค่าเฉลี่ยของ rating ทั้งหมด
        const rating = review.reduce((acc, item) => acc + item.rating, 0) / review.length;

        //อัพเดทค่าเฉลี่ยของ rating   สินค้าทั้งหมด
        const update = await Product.updateMany({_id:{$in:product.map((item)=>item.product_id)}},{rating:rating});
        if(!update) return res.status(404).send({status:false,message:"Product not found"});
        
        const editdeliivery = await Deliivery.findByIdAndUpdate(req.body.deliivery_id,{review_id:add._id},{new:true});

        return res.status(200).send({status:true,data:add});
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//ดึงข้อมูลรีวิวทั้งหมด
module.exports.getAll = async (req, res) => {
    try {
        const review = await Review.find();
        return res.status(200).send({status:true,data:review});
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//ดึงข้อมูลรีวิวตามรหัสรีวิว
module.exports.getByID = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        return res.status(200).send({status:true,data:review});
    } catch (error) {
        return res.status(500).send({ status: false, message: err.message })
    }

}


//ดึงข้อมูลรีวิวตามรหัสสินค้า
module.exports.getByProduct = async (req, res) => {
    try {
        const review = await Review.find({product:{$elemMatch:{product_id:req.params.id}}}).populate('customer_id');
        return res.status(200).send({status:true,data:review});
    } catch (error) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

//แก้ไขข้อมูลรีวิว
module.exports.update = async (req, res) => {
    try {
        const edit = await Review.findByIdAndUpdate(req.params.id, req.body,{new:true});
        if(!edit) return res.status(404).send({status:false,message:"Review not found"});
        return res.status(200).send({status:true,data:edit});
    }
    catch (error) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//ลบข้อมูลรีวิว
module.exports.delete = async (req, res) => {
    try {
        const del = await Review.findByIdAndDelete(req.params.id);
        if(!del) return res.status(404).send({status:false,message:"Review not found"});
        return res.status(200).send({status:true,data:del});
    }
    catch (error) {
        return res.status(500).send({ status: false, message: err.message })
    }
}