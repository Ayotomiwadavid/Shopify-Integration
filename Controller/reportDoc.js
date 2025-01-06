const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

const createReportDoc = async (data, headers) => {
    const csvWriter = createCsvWriter({
        path: process.env.csv_path,
        header: headers,
    });

    try {
        await csvWriter.writeRecords(data);
        console.log(`Data successfully written to ${process.env.csv_path}`);
        return(`Data successfully written to ${process.env.csv_path}`);
    } catch (error) {
        console.error('Error writing data to CSV:', error.message);
        return('Error writing data to CSV:', error.message);
    }
};

module.exports = createReportDoc;