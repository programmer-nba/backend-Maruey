const router = require('express').Router();
const Pv = require('../../controllers/customer/pvController');

router.get('/jangpv/users/:username', Pv.getUserJangPv);
router.post('/jangpv/active', Pv.jangPvActive);
router.post('/jangpv/upgrade', Pv.jangPvUpgrade);
router.post('/jangpv/cashback', Pv.jangPvCashBack);

module.exports = router