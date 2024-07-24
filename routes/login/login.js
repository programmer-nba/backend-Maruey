const express = require('express');
const router = express.Router();
const Login = require("../../controllers/login/login.controller");


//login
router.post('/',Login.login)
//get me เช็ค token
router.get('/getme/',Login.getme)

//gen token เอาไว้ใช้ด้านนอก
router.post('/gentoken/',Login.gentoken)

module.exports = router;