const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto'); // For generating code_verifier and code_challenge
const { router } = require('./Router');
const { getShopReceipt, getListingData } = require('./Controller/Index');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.port || 8000;

// Generate Code Verifier and Code Challenge
let codeVerifier = '';
let codeChallenge = '';

const generatePKCECodes = () => {
    codeVerifier = crypto.randomBytes(32).toString('base64url');
    codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');
};

generatePKCECodes(); // Generate PKCE codes when the server starts

// Etsy Authorization URL with PKCE
const getAuthorizationUrl = () => {
    const clientId = process.env.api_key;
    const redirectUri = process.env.REDIRECT_URI;
    const scopes = 'transactions_r listings_r';

    return `https://www.etsy.com/oauth/connect?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=customState123&code_challenge=${codeChallenge}&code_challenge_method=S256`;
};

app.use('/', getShopReceipt);

// Redirect route for authorization
app.get('/authorize', (req, res) => {
    console.log('Authorize');
    const authUrl = getAuthorizationUrl();
    res.redirect(authUrl);
});

// Exchange Authorization Code for Access Token
app.get('/callback', async (req, res) => {
    const authorizationCode = req.query.code;

    if (!authorizationCode) {
        return res.status(400).send('Authorization code is missing');
    }

    const clientId = process.env.api_key;
    const clientSecret = process.env.api_secret;
    const redirectUri = process.env.REDIRECT_URI;

    const tokenEndpoint = 'https://api.etsy.com/v3/public/oauth/token';

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                code: authorizationCode,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier, // Include code_verifier here
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Access Token Response:', data);
            res.status(200).send('Authorization successful');
        } else {
            console.error('Error exchanging code for token:', data);
            res.status(500).send('Error exchanging code for token');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});


app.listen(PORT, () => {
    console.log('Etsy integration server listening on port:' + PORT);
});
