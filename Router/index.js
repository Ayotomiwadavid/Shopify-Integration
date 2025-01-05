const express = require('express');
const { getShopReceipt, getShop } = require('../Controller/Index');
const router = express.Router();

router.get('/get-shopReceipt', getShopReceipt);
router.get('/get-availableShops', getShop);


module.exports = router;