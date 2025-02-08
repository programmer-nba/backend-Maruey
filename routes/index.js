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
  const last_version = "2.7"
  const current_version = "2.8"
  const update = "08-01-2025"
  return res.status(200).json({
    status: true,
    last_version,
    current_version,
    updatedAt: update
  })
})

router.get('/downloads/app/test', async (req, res) => {
  const filePath = path.join(__dirname, '..', '/downloads', 'app-maruey-test.apk');
  //console.log(filePath)
  return res.sendFile(filePath);
})

router.get('/downloads/app/release', async (req, res) => {
  const filePath = path.join(__dirname, '..', '/downloads', 'app-maruey.apk');
  //console.log(filePath)
  return res.sendFile(filePath);
})

router.get('/file/:file_name', async (req, res) => {
  try {
    // Construct the full file path
    const filePath = path.join(__dirname, '..', 'uploads', req.params.file_name);

    // Send the file to the client
    res.sendFile(filePath, (err) => {
      if (err) {
        // Handle any errors that occur while sending the file
        console.error('Error sending file:', err);
        res.status(404).json({ message: 'File not found' });
      }
    });
  } catch (error) {
    // Handle any other errors that might occur
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/file/:file_name/product', async (req, res) => {
  try {
    // Construct the full file path
    const filePath = path.join(__dirname, '..', 'uploads', 'products', req.params.file_name);

    // Send the file to the client
    res.sendFile(filePath, (err) => {
      if (err) {
        // Handle any errors that occur while sending the file
        console.error('Error sending file:', err);
        res.status(404).json({ message: 'File not found' });
      }
    });
  } catch (error) {
    // Handle any other errors that might occur
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
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
