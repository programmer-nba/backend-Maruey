var express = require('express');
var router = express.Router();
var path = require('path');

const {
  uploadFileCreate,
  deleteFile,
} = require("../functions/uploadfilecreate");

const testtoken = require("../authentication/test");


/* GET home page. */
router.get('/', async (req, res) => {
  const token = await testtoken.gettoken();
  console.log(token)
  res.render('index', { title: 'Express' });
});

router.get('/newtoken', async (req, res) => {
  const token = await testtoken.newtoken();
  console.log(token)
  res.render('index', { title: 'Express' });
});

router.get('/ping', async (req, res) => {
  return res.status(200).json({
    status: true,
    now: new Date(),
  })
})

router.get('/version', async (req, res) => {
  const last_version = "2.1"
  const current_version = "2.2"
  const update = "13-09-2024"
  return res.status(200).json({
    status: true,
    last_version,
    current_version,
    updatedAt: update
  })
})

router.get('/downloads/app/test', async (req, res) => {
  const filePath = path.join(__dirname, '..', '/downloads', 'app-maruey-test.apk');
  console.log(filePath)
  return res.sendFile(filePath);
})

router.get('/downloads/app/release', async (req, res) => {
  const filePath = path.join(__dirname, '..', '/downloads', 'app-maruey.apk');
  console.log(filePath)
  return res.sendFile(filePath);
})

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
