const INSERT_address = /*sql*/`
INSERT INTO customeraddress (customerId,address)
VALUES (?,?)`;

const SELECT_ALL_COUNT = /*sql*/`SELECT count(*) as total FROM customeraddress WHERE deletedAt IS NULL`;

const SELECT_ALL_address = /*sql*/`
SELECT addressId,customerId,
 address
FROM customeraddress
WHERE deletedAt IS NULL
LIMIT ? OFFSET ?`;

const UPDATE_address = /*sql*/`
UPDATE customeraddress SET
address = ?
WHERE addressId = ?`;

const SELECT_ONE = /*sql*/`
SELECT addressId,customerId,address
FROM customeraddress
WHERE addressId = ?
  AND deletedAt IS NULL`;

const DELETE_address = /*sql*/`UPDATE customeraddress SET deletedAt = NOW() WHERE addressId = ?`;



module.exports = {
    INSERT_address,
    SELECT_ALL_COUNT,
    SELECT_ALL_address,
    UPDATE_address,
    SELECT_ONE,
    DELETE_address
};