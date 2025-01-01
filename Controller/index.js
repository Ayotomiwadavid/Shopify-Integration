const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.api_key
const baseUrl = 'https://openapi.etsy.com/v3/application/'
const shop_id = 'displaychamp'

const getShopReceipt = async (req, res, next) => {
    const options = {
        method: 'GET',
        url: `${baseUrl}shops/${shop_id}/receipts`,
        headers: {
            'x-api-key': apiKey,
        },
    };
    try {
        const response = await axios(options)

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error('Failed to get receipts, ', errorDetails)
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
};

const getListingData = async (req, res, next) => {
    const options = {
        method: 'GET',
        url: `${baseUrl}/listings/active`,
        headers: {
            'x-api-key': apiKey,
        },
    };
    try {
        const response = await axios(options);

        const data = await response.json();
        console.log(data);
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getShopReceipt, getListingData };