const query = require("./address.query")

const DEFAULT_LIMIT = 10

function addressForm(req, res) {
    const addressId = req.params?.addressId || '';
    res.render("addressForm", { addressId });
}

const sendMail = require("../mail/mail")

async function addressCreate(req, res) {

    const { customerId, address } = req.body;

    try {
        console.log("Inserting into DB:", address);
        const [result] = await req.db.execute(query.INSERT_address, [
            customerId,
            address
        ]);


        try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "Inserted Successfully",
                `Hello ${addressName}, Your data has been successfully inserted.`
            );
        } catch (mailErr) {

            req.log.error("Mail send error", mailErr);
            console.log("Mail not sent:", mailErr);
        }

        console.log("Insert result:", result);
        res.status(201).json({
            message: "address added successfully",
            result
        });

    } catch (err) {
        console.error("Database insert error:", err.code, err.sqlMessage);
        req.log.error("Database insert error", err);

        res.status(500).send("Database insert error");
    }
}



function addressList(req, res) {
    res.render("addressList", { title: "address List" });
}

async function addressListJson(req, res) {
    try {
        const limit = parseInt(req.query?.limit) || DEFAULT_LIMIT;
        const page = parseInt(req.query?.page) || 1;
        const offset = (page - 1) * limit;

        // Run both queries in parallel
        const [countResult, dataResult] = await Promise.all([
            req.db.query(query.SELECT_ALL_COUNT),
            req.db.query(query.SELECT_ALL_address, [limit, offset])
        ]);

        const totalRecords = countResult[0][0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        const address = dataResult[0];

        res.json({
            address,
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

async function getaddressJsonById(req, res) {
    const addressId = req.params.addressId;
    try {
        const [rows] = await req.db.execute(query.SELECT_ONE, [addressId]);
        if (rows.length === 0) return res.status(404).json({ error: "addressId not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
}

async function addressUpdate(req, res) {
    const addressId = req.params.addressId;
    const { address } = req.body;

    try {
        await req.db.execute(query.UPDATE_address, [address, addressId]);

        try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "address Updated Successfully",
                `address "${addressName}" was successfully updated.`
            );
        } catch (mailErr) {
            console.error("Mail send failed:", mailErr);
        }

        res.status(200).send("address updated successfully");
    } catch (err) {
        req.log.error("Database update error:", err);
        res.status(500).send("Database update error");
    }
}

async function addressDelete(req, res) {
    const addressId = req.params.addressId;

    try {
        const [rows] = await req.db.execute(query.DELETE_address, [addressId]);

        try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "deleted Successfully",
            );
        } catch (mailerr) {
            req.log.error("Mail send error", mailerr);
        }
        res.status(200).send("address deleted successfully");
    } catch (err) {
        console.error("Database delete error:", err);
        res.status(500).send("Database delete error");
    }
}

async function customerListJson(req, res) {
    try {
        const [customer] = await req.db.query("SELECT customerId FROM customer WHERE deletedAt IS NULL");

        res.json(customer);
    } catch (err) {
        console.error("Error fetching customer list:", err);
        res.status(500).json({ error: "Database error" });
    }
}

function setupRoutes(app) {
    
    // ui routes
    app.get("/address/list", addressList)  // list view

    app.get("/address", addressForm); // add view

    app.get("/address/:addressId", addressForm); // edit view

    // crud api routes
    app.post("/api/address", addressCreate)

    app.get("/api/address/list", addressListJson);

    app.put("/api/address/:addressId", addressUpdate);

    app.get("/api/address/:addressId", getaddressJsonById);

    app.delete("/api/address/:addressId", addressDelete);

    app.get("/api/customer/list", customerListJson);
}

module.exports = {
    setupRoutes,
};
