const select_customers = /*sql*/ `
    SELECT customerId, customerName 
    FROM customer
`;

const select_categories = /*sql*/ `
    SELECT categoryId, categoryName 
    FROM category
`;

const select_products_by_category = /*sql*/ `
    SELECT productId, productName, productPrice
    FROM product
    WHERE categoryId = ?
`;

const select_all_count = /*sql*/ `
    SELECT COUNT(*) AS total 
    FROM orders
`;

const select_all = /*sql*/`
   SELECT 
    o.orderId,
    o.orderAt,
    c.customerName,
    a.address,
    cat.categoryName,
    p.productName,
    p.productprice as price,  -- current price
    o.priceAtOrder,           -- saved price at order
    o.Quantity as quantity,
o.totalPrice as total
FROM orders o
LEFT JOIN customer c ON o.customerId = c.customerId
LEFT JOIN customeraddress a ON o.addressId = a.addressId
LEFT JOIN category cat ON o.categoryId = cat.categoryId
LEFT JOIN product p ON o.productId = p.productId
WHERE o.deletedAt IS NULL
ORDER BY o.createdAt DESC
LIMIT ? OFFSET ?;
`;

const select_one = /*sql*/ `
    SELECT 
        o.orderId,
        o.orderAt,
        o.customerId,
        o.addressId,
        o.categoryId,
        o.productId,
        o.Quantity,
        o.totalPrice,
         o.priceAtOrder,
        o.createdAt
    FROM orders o
    WHERE o.orderId = ?
`;

const insert_orders = /*sql*/ `
    INSERT INTO orders
    (customerId,
     addressId,
     productId,
     categoryId,
     Quantity,
     totalPrice,
     priceAtOrder,
     orderAt
     )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;

const update_orders = /*sql*/ `
    UPDATE orders
    SET customerId=?,
        addressId=?,
        productId=?,
        categoryId=?,
        Quantity=?,
        totalPrice=?
        priceAtOrder=?,   
    WHERE orderId=?;
`;




const delete_order = /*sql*/ `
    UPDATE orders 
    SET deletedAt = NOW() 
    WHERE orderId = ? 
`;

module.exports = {
    select_customers,
    select_all_count,
    select_categories,
    select_products_by_category,
    select_all,
    select_one,
    insert_orders,
    update_orders,
    delete_order
};
