const INSERT_customer = /*sql*/`
INSERT INTO customer (customerName, email, phoneNumber)
VALUES (?,?,?)`;

const SELECT_ALL_COUNT = /*sql*/`SELECT count(*) as total FROM customer WHERE deletedAt IS NULL`;

const SELECT_ALL_CUSTOMERS = /*sql*/`
SELECT customerId, customerName, email, phoneNumber
FROM customer
WHERE deletedAt IS NULL
LIMIT ? OFFSET ?`;

const UPDATE_customer = /*sql*/`
UPDATE customer SET
  customerName = ?,
  email =?,
  phoneNumber =?
WHERE customerId = ?`;

const SELECT_ONE = /*sql*/`
SELECT customerId, customerName, email, phoneNumber
FROM customer
WHERE customerId = ?
  AND deletedAt IS NULL`;

const DELETE_customer = /*sql*/`UPDATE customer SET deletedAt = NOW() WHERE customerId = ? AND deletedAt IS NULL`;



module.exports = {
  INSERT_customer,
  SELECT_ALL_COUNT,
  SELECT_ALL_CUSTOMERS,
  UPDATE_customer,
  SELECT_ONE,
  DELETE_customer
};