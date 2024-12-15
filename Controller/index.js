const axios = require('axios');

const getShopReceipt = async (req, res, next) => {
    const options = {
        method: 'GET',
        url: 'https://openapi.etsy.com/v3/application/shops/{shop_id}/receipts',
        headers: {
            'x-api-key': 'qutrr8k9l4',
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

module.exports = { getShopReceipt };