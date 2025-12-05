const query = require("./order.query");

const DEFAULT_LIMIT = 2;

function validateOrder(data) {
    const { customerId, addressId, categoryId, productId, Quantity, totalPrice, priceAtOrder } = data;
    let errors = {};

    if (!customerId) errors.customerId = "Customer is required";
    if (!addressId) errors.addressId = "Address is required";
    if (!categoryId) errors.categoryId = "Category is required";
    if (!productId) errors.productId = "Product is required";
    if (!Quantity || isNaN(Quantity) || Number(Quantity) <= 0) errors.Quantity = "Quantity must be greater than zero";
    if (!totalPrice || isNaN(totalPrice) || Number(totalPrice) <= 0) errors.totalPrice = "Total must be greater than zero";
    if (!priceAtOrder || isNaN(priceAtOrder) || Number(priceAtOrder) <= 0) errors.priceAtOrder = "Total must be greater than zero";
    return errors;
}


function orderForm(req, res) {
    req.session.count = req.session.count ? ++req.session.count : 1
    console.log(req.session)
    res.render("orderForm", {
         title: "Order Form",
         orderId : null,
    });
}

async function orderListPage(req, res) {
    console.log(req.session)
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        console.log("LIST QUERY:", query.select_all);  // Debug
        console.log("COUNT QUERY:", query.select_all_count);

        const [countRows] = await req.db.query(query.select_all_count);
        const totalRecords = countRows[0].total;
        const totalPages = Math.ceil(totalRecords / limit);

        const [orders] = await req.db.query(query.select_all, [limit, offset]);

        res.render("orderlist", {
            orders,
            currentPage: page,
            totalPages,
            totalRecords,
            limit
        });

    } catch (err) {
        console.error("Order page error:", err);
        res.status(500).send("Server error");
    }
}



async function orderEditForm(req, res) {
    const id = req.params.id;

    try {
        // const [result] = await req.db.query(query.select_one, [id]);

        // console.log("Fetched order:", result);

        // if (!result.length) {
        //     return res.status(404).send("Order not found");
        // }

        res.render("orderForm", {
            title: "Edit Order",
             orderId: id
        });

    } catch (err) {
        console.error("Error loading edit form:", err);
        res.status(500).send("Server error");
    }
}




function getCustomers(req, res) {
    req.db.query(query.select_customers, (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to fetch customers" });
        res.json({ customers: rows });

    });
}

async function getAddressesByCustomer(req, res) {
    const customerId = req.params.customerId;

    try {
        const [address] = await req.db.execute(
            "SELECT addressId, address FROM customeraddress WHERE customerId=?",
            [customerId]
        );
        res.json(address);

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Failed to fetch address" });
    }
}


async function getCategories(req, res) {
    try {
        const [category] = await req.db.execute(
            "SELECT categoryId, categoryName FROM category"
        );

        res.json({ category });


    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
}

async function getProductsByCategory(req, res) {
    const categoryId = req.params.categoryId;

    try {
        const [products] = await req.db.execute(
            "SELECT productId, productName,productPrice FROM product WHERE categoryId= ?",
            [categoryId]
        );
        res.json(products);

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Failed to fetch categories" });
    }


}

async function getOrderJson(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const [[countRow]] = await req.db.query(query.select_all_count);
        const totalRecords = countRow.total;
        const totalPages = Math.ceil(totalRecords / limit);

        const [orders] = await req.db.query(query.select_all, [limit, offset]);

        res.json({
            orders,
            currentPage: page,
            totalPages,
            totalRecords,
            limit
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}



function getOrderById(req, res) {

     console.log("getOrderById called with id:", req.params.id);
    const id = req.params.id;

    req.db.query(query.select_one, [id], (err, results) => {

        if (err) return res.status(500).json({ error: "Server error" });
        if (!results.length) return res.status(404).json({ message: "Not found" });

        res.json({ order: results[0] });
    });
}


async function createOrder(req, res) {
    const {
        customerId,
        addressId,
        categoryId,
        productId,
        quantity,
    } = req.body;

    try {
        // 1) GET PRODUCT PRICE & STOCK
        const [productResult] = await req.db.execute(
            "SELECT productprice AS price, productStock FROM product WHERE productId = ?",
            [productId]);

        console.log(productResult)

        if (productResult.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const price = productResult[0].price;
        const priceAtOrder = price;
        const availableStock = productResult[0].productStock;
        const qty = Number(quantity);
        const totalPrice = priceAtOrder * qty;

        // 2) CHECK STOCK
        if (availableStock < qty) {
            return res.status(400).json({ error: "Not enough stock available" });
        }

        let orderAt;

        try {
            const currentYear = new Date().getFullYear();
            const likePattern = `order${currentYear}%`;

            const [lastOrderResults] = await req.db.execute(
                "SELECT orderAt FROM orders WHERE orderAt LIKE ? ORDER BY orderId DESC LIMIT 1",
                [likePattern]
            );

            let nextNumber = 1;
            if (lastOrderResults.length > 0) {
                const lastOrderAt = lastOrderResults[0].orderAt;
                const numberOnly = lastOrderAt.replace(`order${currentYear}`, "");
                nextNumber = Number(numberOnly) + 1;
            }

            orderAt = `order${currentYear}${nextNumber}`;


        } catch (err) {
            console.error("Error generating orderAt:", err);
            return res.status(500).json({ error: "Failed to generate order number" });
        }




        // 3) INSERT ORDER
        const currentYear = new Date().getFullYear();
        const likePattern = `order${currentYear}%`; const [orderResult] = await req.db.execute(



            query.insert_orders,
            [
                customerId,
                addressId,
                productId,
                categoryId,
                qty,
                totalPrice,
                priceAtOrder,
                orderAt
            ]
        );

        // 4) UPDATE PRODUCT STOCK
        await req.db.execute(
            "UPDATE product SET productStock = productStock - ? WHERE productId = ?",
            [qty, productId]
        );

        return res.status(201).json({
            message: "Order created successfully and stock updated",
            orderId: orderResult.insertId
        });

    } catch (err) {
        console.error("Create Order Error:", err);
        return res.status(500).json({ error: "Server Error" });
    }
}

async function updateOrder(req, res) {
    const id = req.params.id;
    const { customerId, addressId, categoryId, productId, quantity } = req.body;

    const errors = validateOrder(req.body);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // 1️⃣ Get OLD order priceAtOrder
        const [oldOrderResult] = await req.db.execute(
            "SELECT priceAtOrder FROM orders WHERE orderId = ?",
            [id]
        );

        if (oldOrderResult.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const priceAtOrder = oldOrderResult[0].priceAtOrder;
        const qty = Number(quantity);

        const [productResult] = await req.db.execute(
            "SELECT productprice AS price FROM product WHERE productId = ?",
            [productId]
        );

        if (productResult.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }


        const totalPrice = priceAtOrder * qty;

        const [result] = await req.db.execute(
            query.update_order,
            [
                customerId,
                addressId,
                productId,
                categoryId,
                qty,
                totalPrice,
                priceAtOrder,
            ]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json({ message: "Order updated successfully" });

    } catch (err) {
        console.error("Update Order Error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}


async function deleteOrder(req, res) {
    const id = req.params.id;

    try {
        const [orderResult] = await req.db.execute(
            "SELECT productId, quantity FROM orders WHERE orderId = ? AND deletedAt IS NULL",
            [id]
        );
        if (orderResult.length === 0) {
            return res.status(404).send("Order not found");
        }
        const { productId, quantity } = orderResult[0];

        await req.db.execute(
            "UPDATE product SET productStock = productStock + ? WHERE productId = ?",
            [quantity, productId]
        );

        // 3️⃣ Delete the order (or soft-delete)
        const [deleteResult] = await req.db.execute(query.delete_order, [id]);

        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).send("order deleted successfully");
    } catch (err) {
        console.error("Database delete error:", err);
        res.status(500).send("Database delete error");
    }
}









function setupRoutes(app) {
    app.get("/order/orderlist", orderListPage);
    app.get("/order/orderform", orderForm);
    app.get("/order/edit/:id", orderEditForm);

    app.get("/api/order/orderlist", getOrderJson);
    app.get("/api/order/:id", getOrderById);

    app.post("/api/order", createOrder);
    app.put("/api/order/:id", updateOrder);
    app.delete("/api/order/:id", deleteOrder);

    app.get("/api/customer/list", getCustomers);
    app.get("/api/address/:customerId", getAddressesByCustomer);
    app.get("/api/category/list", getCategories);
    app.get("/api/product/:categoryId", getProductsByCategory);
}

module.exports = { setupRoutes };
