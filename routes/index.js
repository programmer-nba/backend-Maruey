var express = require('express');
var router = express.Router();

const {
  uploadFileCreate,
  deleteFile,
} = require("../functions/uploadfilecreate");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.put('/deleteimage/',async(req,res)=>{

    const idarray = req.body.id;
    idarray.forEach(async (element) => {
     
      const data =extractIdFromUrl(element);
     
      await deleteFile(data);
    });
    
    return res.status(200).send({message:"ลบรูปภาพเรียบร้อย"});
});
  

function extractIdFromUrl(url) {
  const match = url.split('https://drive.google.com/uc?id=');

  return match ? match[1] : null;
}
module.exports = router;
