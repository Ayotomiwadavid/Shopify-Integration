const express = require('express');
const { getShopReceipt } = require('../Controller/Index');
const router = express.Router();

router.get('/get-shopReceipt', getShopReceipt);


module.exports = {router};