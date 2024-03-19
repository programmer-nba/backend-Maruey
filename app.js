var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cor = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

process.env.TZ='UTC'
var app = express();
//เชื่ิอมdatabase
const urldatabase =process.env.ATLAS_MONGODB
mongoose.Promise = global.Promise
mongoose.connect(urldatabase).then(()=>console.log("connect")).catch((err)=>console.error(err))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({limit: '300mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cor())
//router
const prefix = '/v1/Backend-Maruey'
app.use(prefix+'/', require('./routes/index'));
//ผู้ใช้งาน
app.use(prefix+'/admin',require('./routes/admin/admin'))
//ล็อคอิน(admin,dealer,partner)
app.use(prefix+'/login',require('./routes/login/login'))
//dealer คู่ค้า
app.use(prefix+'/dealer',require('./routes/dealer/dealer'))
// partner 
app.use(prefix+'/partner',require('./routes/partner/partner'))

//สินค้า
app.use(prefix+'/product',require('./routes/product/product'))
//หมวดหมู่สินค้า
app.use(prefix+'/category',require('./routes/product/category'))
//หมวดหมู่สินค้าย่อย
app.use(prefix+'/type',require('./routes/product/type'))

//สัญญา dealer
app.use(prefix+'/dealercontract',require('./routes/contract/dealercontract'))




app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // หรือกำหนด origin ที่เฉพาะเจาะจง
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const port = process.env.PORT || 5713;
app.listen(port, console.log(`Listening on port ${port}`));



