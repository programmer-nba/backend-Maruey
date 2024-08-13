const router = require('express').Router();
const Pv = require('../../controllers/customer/pvController');

//router.post('/runbonusactive', Pv.runBonusActive);
router.post('/jangpvactive', Pv.jangPvActive);

module.exports = router