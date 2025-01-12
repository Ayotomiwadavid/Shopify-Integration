const baseUrl = 'https://shopify-integration-sefh.onrender.com/'

const getShopOderDetails = async () => {

    console.log('Getting Order Data...')

    try {
        const response = await fetch(`${baseUrl}get-shopReceipt`, {
            method: 'GET',
            headers: {
                'content-Type': 'application/json'
            }
        });
    
        if(!response.ok){
            throw new Error('An error occured');
        }

        const result = await response.json();

        console.log(result);

       let fileUrl = './etsy_receipt.csv';

        console.log(fileUrl);

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
        
    } catch (error) {
        console.log(error);
    }
}

const getShopInventory = async () => {
    console.log('Getting Listing Data...')

    try {
        const response = await fetch(`${baseUrl}getShop_listing`, {
            method: 'GET',
            headers: {
                'content-Type': 'application/json'
            }
        });
    
        if(!response.ok){
            throw new Error('An error occured');
        }

        const result = await response.json();

        console.log(result);

        let fileUrl = './etsy_receipt.csv'

        console.log(fileUrl);

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
        
    } catch (error) {
        console.log(error);
    }
}

const getTransactionDetails = async () => {
    console.log('Geeting Your Shop Transactions...');

    try {
        const response = await fetch(`${baseUrl}getShop-transactions`, {
            method: 'GET',
            headers: {
                'content-Type': 'application/json'
            }
        });
    
        if(!response.ok){
            throw new Error('An error occured');
        }

        const result = await response.json();

        console.log(result);

        let fileUrl = './etsy_transactions.csv'

        console.log(fileUrl);

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
    } catch (error) {
        console.log(error);
    }
}