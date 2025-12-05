const INSERT_manufacturer = /*sql*/`
INSERT INTO manufacturer (manufacturerName)
VALUES (?)`;

const SELECT_ALL_COUNT = /*sql*/`SELECT count(*) as total FROM manufacturer WHERE deletedAt IS NULL`;

const SELECT_ALL_manufacturer = /*sql*/`
SELECT manufacturerId, manufacturerName 
FROM manufacturer
WHERE deletedAt IS NULL
LIMIT ? OFFSET ?`;

const UPDATE_manufacturer = /*sql*/`
UPDATE manufacturer SET
manufacturerName = ?
WHERE manufacturerId = ?`;

const SELECT_ONE = /*sql*/`
SELECT manufacturerId,manufacturerName 
FROM manufacturer
WHERE manufacturerId = ?
  AND deletedAt IS NULL`;

const DELETE_manufacturer = /*sql*/`UPDATE manufacturer SET deletedAt = NOW() WHERE manufacturerId = ?`;



module.exports = {
    INSERT_manufacturer,
    SELECT_ALL_COUNT,
    SELECT_ALL_manufacturer,
    UPDATE_manufacturer,
    SELECT_ONE,
    DELETE_manufacturer
};