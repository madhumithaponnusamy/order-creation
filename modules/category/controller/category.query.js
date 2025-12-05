const INSERT_category = /*sql*/`
INSERT INTO category (categoryName, description )
VALUES (?,?)`;

const SELECT_ALL_COUNT = /*sql*/`SELECT count(*) as total FROM category WHERE deletedAt IS NULL`;

const SELECT_ALL_category = /*sql*/`
SELECT categoryId, categoryName, description 
FROM category
WHERE deletedAt IS NULL
LIMIT ? OFFSET ?`;

const UPDATE_category = /*sql*/`
UPDATE category SET

  categoryName = ?,
   description = ?
WHERE categoryId = ?`;

const SELECT_ONE = /*sql*/`
SELECT categoryId,categoryName, description 
FROM category
WHERE categoryId = ?
  AND deletedAt IS NULL`;

const DELETE_category = /*sql*/`UPDATE category SET deletedAt = NOW() WHERE categoryId = ?`;



module.exports = {
    INSERT_category,
    SELECT_ALL_COUNT,
    SELECT_ALL_category,
    UPDATE_category,
    SELECT_ONE,
    DELETE_category
};