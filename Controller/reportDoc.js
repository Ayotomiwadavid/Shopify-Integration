const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

const createReportDoc = async (csvPath, data, headers) => {
    const csvWriter = createCsvWriter({
        path: csvPath,
        header: headers,
    });

    try {
        await csvWriter.writeRecords(data);
        console.log(`Data successfully written to ${csvPath}`);
        return(`Data successfully written to ${csvPath}`);
    } catch (error) {
        console.error('Error writing data to CSV:', error.message);
        return('Error writing data to CSV:', error.message);
    }
};

module.exports = createReportDoc;