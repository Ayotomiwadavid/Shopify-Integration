const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios'); // Import axios
const router = require('./Router/index');
const path = require('path')
require('dotenv').config();

const refreshTokenId = process.env.refresh_token

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

app.use('/', router);

app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the HTML page
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(filePath);
});

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
        const response = await axios.post(tokenEndpoint, new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: authorizationCode,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier, // Include code_verifier here
        }).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const data = response.data;

        console.log('Access Token Response:', data);
        res.status(200).send('Authorization successful');
    } catch (error) {
        console.error('Error exchanging code for token:', error.response?.data || error.message);
        res.status(500).send('Error exchanging code for token');
    }
});

// Refresh Token Function
const refreshToken = async (refreshToken) => {
    const clientId = process.env.api_key;
    const clientSecret = process.env.api_secret;

    const tokenEndpoint = 'https://api.etsy.com/v3/public/oauth/token';

    try {
        const response = await axios.post(tokenEndpoint, new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-api-key': process.env.api_key,
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
        });

        const data = response.data;

        console.log('New Access Token Response:', data);
        return data; // Return the new access token and refresh token
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error_description || 'Error refreshing token');
    }
};

// Example Route to Refresh Token
app.get('/refresh-token', async (req, res) => {
    const  refresh_token  = refreshTokenId

    console.log('refresh_token')

    if (!refresh_token) {
        return res.status(400).send('Refresh token is missing');
    }

    try {
        const tokenData = await refreshToken(refresh_token);
        res.status(200).json(tokenData);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log('Etsy integration server listening on port:' + PORT);
});