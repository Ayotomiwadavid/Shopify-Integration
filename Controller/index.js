const axios = require('axios');
const createReportDoc = require('./reportDoc');
require('dotenv').config();

let access_token = '981916249.yrgp_Yr3Ts9Oz4241R5kAARhGeqdRgJBVfCbAqsCGLRN_JARxiEWq-oo3VGTfGpcXJ1xa7OYQFxneWVv-zpRf4gEae';
let refresh_token = '981916249.sLRLXrGIhcmitBpjYwNLXZeEFA_m8Eqz8LuMiH53mSAlgNd4RpAqBHhCW-gE9xvF2YTQUJpjGShsrgqyM_oZtqivmF'

const apiKey = process.env.api_key
const baseUrl = 'https://openapi.etsy.com/v3/application/'
const shop_name = 'displaychamp'
const shop_id = 54850131

const refreshToken = async (req, res, next) => {
    const url = 'https://api.etsy.com/v3/public/oauth/token';

    const data = {
        grant_type: 'refresh_token',
        client_id: process.env.api_key,
        refresh_token: refresh_token,
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // The new access token is in the response
        console.log('New Access Token:', response.data.access_token);
        console.log('New Refresh Token:', response.data.refresh_token);

        access_token = response.data.access_token;
        refresh_token = response.data.refresh_token;

        return response.data;
    } catch (error) {
        console.error('Error refreshing Etsy token:', error.response?.data || error.message);
    }
}

const getShop = async (req, res, next) => {

    console.log("Get all shops");

    const endpoint = `https://openapi.etsy.com/v3/application/shops?shop_name=${shop_name}&limit=25&offset=0`

    const options = {
        method: 'GET',
        url: endpoint,
        headers: {
            'x-api-key': apiKey,
        },
    }

    try {
        const response = await axios(options);

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`Failed to get shops: ${response.status} - ${response.statusText}`);
        }

        const data = response.data;
        console.log('Shop Data:', data);

        res.status(200).json(data);
    } catch (error) {
        console.log(error);
    }
}

const getShopReceipt = async (req, res, next) => {
    console.log('get shop receipt');
    let filePath = './Public/etsy_receipt.csv'
    const shopOrders = [];
    const options = {
        method: 'GET',
        url: `${baseUrl}shops/${shop_id}/receipts`,
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'x-api-key': apiKey,
        },
    };
    try {

        const response = await axios(options);

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`Failed to get shop receipt: ${response.status} - ${response.statusText}`);
        }

        const data = response.data.results;
        console.log('Shop Receipt:', data.length);

        data.forEach(element => {
            const { 
                name, 
                formatted_address, 
                transactions, // Access transactions array here
                discount_amt: { amount }, 
                is_paid 
            } = element;
        
            // Iterate over the transactions array
            transactions.forEach(transaction => {
                const { title, sku, quantity, variations, price, shipping_cost } = transaction;
        
                // Flatten variations
                const flattenedVariations = variations.reduce((acc, variation) => {
                    acc[variation.formatted_name] = variation.formatted_value;
                    return acc;
                }, {});
        
                // Push data into shopOrders
                shopOrders.push({
                    name,
                    formatted_address,
                    title,
                    sku,
                    quantity,
                    ...flattenedVariations,
                    price: price.amount,
                    divisor: price.divisor,
                    currency_code: price.currency_code,
                    shipping_cost: shipping_cost.amount/shipping_cost.divisor,
                    amount: price.amount/price.divisor*quantity,
                    is_paid,
                    discount_amt: amount
                });
            });
        
            console.log(shopOrders);
        });

        const shopOrdersCSVHeader = [
            { id: 'name', title: 'Buyer Name' },
            { id: 'formatted_address', title: 'Buyer Address' },
            { id: 'title', title: 'Product Name' },
            { id: 'sku', title: 'SKU' },
            { id: 'quantity', title: 'Quantity Sold' },
            { id: 'variations', title: 'Product Variations' },
            { id: 'price', title: 'Product Price' },
            { id: 'shipping_cost', title: 'Shipping Cost' },
            { id: 'amount', title: 'Order Amount' },
            { id: 'currency_code', title: 'Product Currency' },
            {id: 'discount_amt', title: 'Discount Amount'},
        ];

        const result = await createReportDoc(filePath, shopOrders, shopOrdersCSVHeader);

        console.log(result);

        res.status(200).json({msg: result, filePath});
    } catch (error) {
        console.log(error);
    }
};

const getListingData = async (req, res, next) => {
    const shopProducts = [];
     let filePath = './Public/etsy_receipt.csv'
    const options = {
        method: 'GET',
        url: `${baseUrl}/listings/active`,
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'x-api-key': apiKey,
        },
    };
    try {

        const response = await axios(options);

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`Failed to get shop products data: ${response.status} - ${response.statusText}`);
        }

        const data = response.data.results;
        console.log('Listing Count:', data.length);

        data.forEach(element => {
            const { listing_id, title, price: { amount, divisor, currency_code }, quantity } = element
            shopProducts.push({
                listing_id,
                title,
                amount,
                divisor,
                currency_code,
                quantity
            })
            console.log(shopProducts);
        });

        const inventoryCSVHeader = [
            { id: 'listing_id', title: 'Product ID' },
            { id: 'title', title: 'Product Name' },
            { id: 'amount', title: 'Product Amount' },
            { id: 'divisor', title: 'Product Divisor' },
            { id: 'customer_email', title: 'Customer Email' },
            { id: 'currency_code', title: 'Product Currency' },
            { id: 'total_order_value', title: 'Total Order Value' },
            { id: 'quantity', title: 'Inventory Level' },
        ];

        const result = await createReportDoc(filePath, shopProducts, inventoryCSVHeader);

        console.log(result);


        res.status(200).json({msg: result, filePath});

    } catch (error) {
        console.log(error);
    }
}

const getShopTransaction = async (req, res, next) => {

    let filePath = './Public/etsy_transactions.csv'
    let transactiionArray = []

    const options = {
        method: 'GET',
        url: `${baseUrl}shops/${shop_id}/transactions`,
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'x-api-key': apiKey,
        },
    };

    try {
        const response = await axios(options);

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`Failed to get shop transaction data: ${response.status} - ${response.statusText}`);
        }

        const data = response.data.results;

        // Initialize financial data
        let grossRevenue = 0;
        let netRevenue = 0;
        let transactionFees = 0;
        let shippingFees = 0;
        let refunds = 0;
        let commissionFees = 0;

        // Etsy fee percentage (adjust based on Etsy's fee structure)
        const ETSY_COMMISSION_RATE = 0.05; // Example: 5%

        data.forEach(transaction => {
            const grossAmount = transaction.price.amount / transaction.price.divisor;
            const shippingAmount = transaction.shipping_cost.amount / transaction.shipping_cost.divisor;

            grossRevenue += grossAmount;
            shippingFees += shippingAmount;

            // Calculate Etsy commission
            const commission = grossAmount * ETSY_COMMISSION_RATE;
            commissionFees += commission;

            // Simulate transaction fees (replace with real calculation)
            const transactionFee = grossAmount * 0.03; // Example: 3%
            transactionFees += transactionFee;

            // Add refund handling (if applicable)
            if (transaction.transaction_type === 'refund') {
                refunds += grossAmount;
            }
        });

        // Calculate net revenue
        netRevenue = grossRevenue - (transactionFees + commissionFees + refunds);

        // Prepare final output
        const financialSummary = {
            grossRevenue,
            netRevenue,
            transactionFees,
            commissionFees,
            shippingFees,
            refunds,
        };

        transactiionArray.push(financialSummary);

        console.log('Financial Summary:', transactiionArray);

        const transactionCsvHeader = [
            { id: 'grossRevenue', title: 'Gross Revenue' },
            { id: 'netRevenue', title: 'Net Revenue' },
            { id: 'transactionFees', title: 'Transaction Fees' },
            { id: 'commissionFees', title: 'Commission Fees' },
            { id: 'shippingFees', title: 'Shipping Fees' },
            { id: 'refunds', title: 'Refunds' },
        ]

        const result = await createReportDoc(filePath, transactiionArray, transactionCsvHeader);

        console.log(result);

        res.status(200).json({msg: result, filePath});

    } catch (error) {
        console.error('Error fetching shop transactions:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Automatically refresh the token every 30 minutes
setInterval(() => {
    console.log('Refreshing token...');
    refreshToken();
}, 30 * 60 * 1000); // 30 minutes in milliseconds

 
module.exports = { getShopReceipt, getListingData, getShop, getShopTransaction };