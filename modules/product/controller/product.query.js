const INSERT_product = /*sql*/`
INSERT INTO product (productName, productPrice, productStock, categoryId, manufacturerId)
 VALUES (?, ?, ?, ?, ?)
`;

const SELECT_ALL_COUNT = /*sql*/`SELECT count(*) as total FROM product WHERE deletedAt IS NULL`;

const SELECT_ALL_product = /*sql*/`
SELECT productId,productName, productPrice, productStock, categoryId, manufacturerId 
FROM product
WHERE deletedAt IS NULL
LIMIT ? OFFSET ?`;

const UPDATE_product = /*sql*/`
UPDATE product SET
productName = ?,
 productPrice = ?, 
 productStock = ?, 
 categoryId = ?, 
 manufacturerId = ?
 WHERE productId = ?`;

const SELECT_ONE = /*sql*/`
SELECT productId,
productName,
productPrice,
productStock,
categoryId,
manufacturerId
FROM product
WHERE productId = ?
  AND deletedAt IS NULL`;

const DELETE_product = /*sql*/`UPDATE product SET deletedAt = NOW() WHERE productId = ?`;



module.exports = {
    INSERT_product,
    SELECT_ALL_COUNT,
    SELECT_ALL_product,
    UPDATE_product,
    SELECT_ONE,
    DELETE_product
};