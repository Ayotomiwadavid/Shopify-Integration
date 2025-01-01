const express = require('express');
const bodyParser = require('body-parser');
const { router } = require('./Router');
const { getShopReceipt, getListingData } = require('./Controller/Index');
require('dotenv').config();


const app = express();

app.use(bodyParser.json());


app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/', router)

const PORT = process.env.port || 8000

// Etsy Authorization URL
const getAuthorizationUrl = () => {
    const clientId = process.env.api_key;
    const redirectUri = process.env.REDIRECT_URI;
    const scopes = 'transactions_r listings_r';

    return `https://www.etsy.com/oauth/connect?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=customState123`;
};

// Redirect route
app.get('/authorize', (req, res) => {
    console.log('Authorize')
    const authUrl = getAuthorizationUrl();
    res.redirect(authUrl);
});

// app.get('/', (req, res, next) => {
//     console.log('Api endpoint in place.')
//     getListingData();
// });

app.listen(PORT, () => {
    console.log('shopify integration server listening on port:' + PORT);
});