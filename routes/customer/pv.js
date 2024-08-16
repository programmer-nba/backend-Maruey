const router = require('express').Router();
const Pv = require('../../controllers/customer/pvController');

router.post('/jangpv/active', Pv.jangPvActive);
router.post('/jangpv/upgrate', Pv.jangPvUpgrade);

module.exports = router