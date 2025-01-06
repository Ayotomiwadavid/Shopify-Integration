const axios = require('axios');
const createReportDoc = require('./reportDoc');
require('dotenv').config();

const apiKey = process.env.api_key
const baseUrl = 'https://openapi.etsy.com/v3/application/'
const shop_name = 'displaychamp'
const shop_id = 54850131

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
    const shopOrders = [];
    const options = {
        method: 'GET',
        url: `${baseUrl}shops/${shop_id}/receipts`,
        headers: {
            'Authorization': `Bearer ${process.env.auth_token}`,
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

        const result = await createReportDoc(shopOrders, shopOrdersCSVHeader);

        console.log(result);


        res.status(200).json(shopOrders);
    } catch (error) {
        console.log(error);
    }
};

const getListingData = async (req, res, next) => {
    const shopProducts = [];
    const options = {
        method: 'GET',
        url: `${baseUrl}/listings/active`,
        headers: {
            'Authorization': `Bearer ${process.env.auth_token}`,
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

        const result = await createReportDoc(shopProducts, inventoryCSVHeader);

        console.log(result);


        res.status(200).json(result);

    } catch (error) {
        console.log(error);
    }
}

const getShopTransaction = async (req, res, next) => {
    const options = {
        method: 'GET',
        url: `${baseUrl}shops/${shop_id}/transactions`,
        headers: {
            'Authorization': `Bearer ${process.env.auth_token}`,
            'x-api-key': apiKey,
        },
    };

    try {
        const response = await axios(options);

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`Failed to get shop transaction data: ${response.status} - ${response.statusText}`);
        }

        const data = response.data.results;
        console.log('Shop Transactions:', data);

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching shop transactions:', error.message);
        res.status(500).json({ error: error.message });
    }
};


module.exports = { getShopReceipt, getListingData, getShop, getShopTransaction };