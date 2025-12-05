
const mysql = require("mysql2/promise");


async function createDBConnection() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'ecommercedetails'
    });
    return connection;
}

module.exports = createDBConnection;
