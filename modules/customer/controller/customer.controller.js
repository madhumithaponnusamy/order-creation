
const query = require("./customer.query")
const DEFAULT_LIMIT = 10

const sendMail = require("../mail/mail")


function customerForm(req, res) {
    const customerId = req.params?.customerId || '';
    res.render("customerForm", { customerId });
}

async function customerCreate(req, res) {

    const { name, email, phoneNumber } = req.body;

    try {

        if (!name || !email || !phoneNumber) {
            return res.status(400).send("All fields are required")
        }

        if (!name.trim()) {
            return res.status(400).send("Invalid Name format");
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailPattern.test(email.trim())) {
            return res.status(400).send("Invalid email format");
        }

        if (!phoneNumber.trim() || phoneNumber.trim().length !== 10) {
            return res.status(400).send("Invalid Phone Number format");
        }


        req.log.info("Inserting into DB:", name, email, phoneNumber);
        const [result] = await req.db.execute(query.INSERT_customer, [
            name,
            email,
            phoneNumber
        ]);

        try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "Inserted Successfully",
                `Hello ${customerName}, Your data has been successfully inserted.`
            );
        } catch (mailErr) {
            req.log.error("Mail send error", mailErr);
            req.log.info("Mail not sent:", mailErr);
        }

        req.log.info("Insert result:", result);
        res.status(201).json({
            message: "Customer added successfully",
            result
        });

    } catch (err) {
        console.error("Database insert error:", err.code, err.sqlMessage);
        req.log.error("Database insert error", err);

        res.status(500).send("Database insert error");
    }
}

function customerList(req, res) {
    res.render("customerList", { title: "customer List" });
}

async function customerListJson(req, res) {
    try {
        const limit = parseInt(req.query?.limit) || DEFAULT_LIMIT;
        const page = parseInt(req.query?.page) || 1;
        const offset = (page - 1) * limit;

        // Run both queries in parallel
        const [countResult, dataResult] = await Promise.all([
            req.db.query(query.SELECT_ALL_COUNT),
            req.db.query(query.SELECT_ALL_CUSTOMERS, [limit, offset])
        ]);

        const totalRecords = countResult[0][0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        const customers = dataResult[0];

        res.json({
            customers,
            currentPage: page,
            totalPages,
            totalRecords,
            limit
        });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getcustomerJsonById(req, res) {
    const customerId = req.params.customerId;
    try {
        const [rows] = await req.db.execute(query.SELECT_ONE, [customerId]);
        if (rows.length === 0) return res.status(404).json({ error: "customerId not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
}

async function customerUpdate(req, res) {
    const customerId = req.params.customerId;
    const { customerName, email, phoneNumber } = req.body;

    try {
        await req.db.execute(query.UPDATE_customer, [customerName, email, phoneNumber, customerId]);

        sendMail(email, "Updated Successful", "your profile is successfully updated.")
            .then((result) => {
                req.log.info(result)
            })

        res.status(200).send("customer updated successfully");
    } catch (err) {
        req.log.error("Database update error:", err);
        res.status(500).send("Database update error");
    }
}

async function customerDelete(req, res) {
    const customerId = req.params.customerId;

    try {
        const [rows] = await req.db.execute(query.DELETE_customer, [customerId]);

        try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "deleted Successfully",
            );
        } catch (mailerr) {
            req.log.error("Mail send error", mailerr);
        }
        res.status(200).send("customer deleted successfully");
    } catch (err) {
        console.error("Database delete error:", err);
        res.status(500).send("Database delete error");
    }
}












function setupRoutes(app) {
    app.get("/customer", customerForm);

    app.post("/api/customer", customerCreate)

    app.get("/customer/list", customerList)

    app.get("/api/customer/list", customerListJson);

    app.put("/api/customer/:customerId", customerUpdate);

    app.get("/api/customer/:customerId", getcustomerJsonById);

    app.get("/customer/:customerId", customerForm);

    app.delete("/api/customer/:customerId", customerDelete);
}

module.exports = {
    setupRoutes,
};