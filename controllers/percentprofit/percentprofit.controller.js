const {Percentprofit} = require('../../models/percentprofit/percentprofit.schema');   

//เพิ่มข้อมูลเปอร์เซ้นต์กำไร
module.exports.add = async (req, res) => {
    try{
        const add = new Percentprofit({ 
            percentpartner: req.body.percentpartner,
            percentmaruey: req.body.percentmaruey,
            sharelink: req.body.sharelink
        });
        const save = await add.save();
        return res.status(200).send({ message: "เพิ่มข้อมูลสำเร็จ",data:save , status: true });
    }catch(err){
       return res.status(500).send({ message: err.message, status: false });
    }
};

//แก้ไขข้อมูลเปอร์เซ้นต์กำไร
module.exports.edit = async (req, res) => {
    try{
        const percentprofit = await Percentprofit.findById(req.params.id);
        if(!percentprofit) return res.status(400).send({ message: "ไม่พบข้อมูล", status: false });
        const edit = await Percentprofit.findByIdAndUpdate(req.params.id, {
            percentpartner: req.body.percentpartner,
            percentmaruey: req.body.percentmaruey,
            sharelink: req.body.sharelink
        });
        return res.status(200).send({ message: "แก้ไขข้อมูลสำเร็จ",data:edit , status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }
}


//แก้ไขข้อมุลเปอร์เซ็นต์กำไร ของ partner
module.exports.editpercentpartner = async (req, res) => {
    try{
        const percentprofit = await Percentprofit.findById(req.params.id);
        if(!percentprofit) return res.status(400).send({ message: "ไม่พบข้อมูล", status: false });
        const edit = await Percentprofit.findByIdAndUpdate(req.params.id, {
            percentpartner: req.body.percentpartner
        });
        return res.status(200).send({ message: "แก้ไขข้อมูลสำเร็จ",data:edit , status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }

}
//แก้ไขข้อมูลเปอร์เซ้นต์กำไร ของ สินค้ามารวย
module.exports.editpercentmaruey = async (req, res) => {
    try{
        const percentprofit = await Percentprofit.findById(req.params.id);
        if(!percentprofit) return res.status(400).send({ message: "ไม่พบข้อมูล", status: false });
        const edit = await Percentprofit.findByIdAndUpdate(req.params.id, {
            percentmaruey: req.body.percentmaruey
        });
        return res.status(200).send({ message: "แก้ไขข้อมูลสำเร็จ",data:edit , status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }

}

//แก้ไขข้อมูลเปอร์เซ้นต์กำไร ของ รายได้จากการแชร์ลิงค์
module.exports.editsharelink = async (req, res) => {
    try{
        const percentprofit = await Percentprofit.findById(req.params.id);
        if(!percentprofit) return res.status(400).send({ message: "ไม่พบข้อมูล", status: false });
        const edit = await Percentprofit.findByIdAndUpdate(req.params.id, {
            sharelink: req.body.sharelink
        });
        return res.status(200).send({ message: "แก้ไขข้อมูลสำเร็จ",data:edit , status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }

}


//ดึงข้อมูลเปอร์เซ้นต์กำไร
module.exports.get = async (req, res) => {
    try{
        const get = await Percentprofit.findOne();
        return res.status(200).send({ message: "ดึงข้อมูลสำเร็จ",data:get , status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }
}

//ลบข้อมูลเปอร์เซ้นต์กำไร
module.exports.delete = async (req, res) => {
    try{
        const del = await Percentprofit.findByIdAndDelete(req.params.id);
        return res.status(200).send({ message: "ลบข้อมูลสำเร็จ",data:del , status: true });
    }catch(err){
        return res.status(500).send({ message: err.message, status: false });
    }
}