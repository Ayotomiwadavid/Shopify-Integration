const express = require('express');
const bodyparser = require('body-parser');
require('dotenv').config();


const app = express();

app.use(bodyparser);

const PORT = process.env.port || 8000

app.get('/', (req, res, next) => {
    console.log('Api endpoint in place.')
});

app.listen(PORT, () => {
    console.log('shopify integration server listening on port:' + PORT);
});