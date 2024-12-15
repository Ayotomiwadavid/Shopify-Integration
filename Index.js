const express = require('express');
const bodyParser = require('body-parser');
const { router } = require('./Router');
const { getShopReceipt } = require('./Controller/Index');
require('dotenv').config();


const app = express();

app.use(bodyParser.json());


app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/', router)

const PORT = process.env.port || 8000

app.get('/', (req, res, next) => {
    console.log('Api endpoint in place.')
    getShopReceipt();
});

app.listen(PORT, () => {
    console.log('shopify integration server listening on port:' + PORT);
});