const express = require('express');
const { getShopReceipt, getShop, getListingData, getShopTransaction } = require('../Controller/Index');
const router = express.Router();

router.get('/get-shopReceipt', getShopReceipt);
router.get('/get-availableShops', getShop);
router.get('/getShop_listing', getListingData);
router.get('/getShop-transactions', getShopTransaction);


module.exports = router;