const query = require("./manufacturer.query")

const DEFAULT_LIMIT = 2

function manufacturerForm(req, res) {
    const manufacturerId = req.params?.manufacturerId || '';
    res.render("manufacturerForm", { manufacturerId });
}

const sendMail = require("../mail/mail")

async function manufacturerCreate(req, res) {
 
    const { manufacturerName } = req.body;

    try {
        console.log("Inserting into DB:", manufacturerName );
        const [result] = await req.db.execute(query.INSERT_manufacturer, [
           manufacturerName  
        ]);

       
        try {
            await sendMail(
                "madhumitha0244@gmail.com", 
                "Inserted Successfully",
                `Hello ${manufacturerName}, Your data has been successfully inserted.`
            );
        } catch (mailErr) {

            req.log.error("Mail send error", mailErr);
            console.log("Mail not sent:", mailErr);
        }

        console.log("Insert result:", result);
        res.status(201).json({
            message: "manufacturer added successfully",
            result
        });

    } catch (err) {
       console.error("Database insert error:", err.code, err.sqlMessage);
        req.log.error("Database insert error", err);
          
        res.status(500).send("Database insert error");
    }
}



function manufacturerList(req, res) {
    res.render("manufacturerList", { title: "manufacturer List" });
}

async function manufacturerListJson(req, res) {
    try {
        const limit = parseInt(req.query?.limit) || DEFAULT_LIMIT;
        const page = parseInt(req.query?.page) || 1;
        const offset = (page - 1) * limit;

        // Run both queries in parallel
        const [countResult, dataResult] = await Promise.all([
            req.db.query(query.SELECT_ALL_COUNT),
            req.db.query(query.SELECT_ALL_manufacturer, [limit, offset])
        ]);

        const totalRecords = countResult[0][0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        const manufacturer= dataResult[0];

        res.json({
            manufacturer,
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

async function getmanufacturerJsonById(req, res) {
    const manufacturerId = req.params.manufacturerId;
    try {
        const [rows] = await req.db.execute(query.SELECT_ONE, [manufacturerId]);
        if (rows.length === 0) return res.status(404).json({ error: "manufacturerId not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
}

async function manufacturerUpdate(req, res) {
    const manufacturerId = req.params.manufacturerId;
    const { manufacturerName } = req.body;

    try {
        await req.db.execute(query.UPDATE_manufacturer, [manufacturerName , manufacturerId]);

         try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "manufacturer Updated Successfully",
                `manufacturer "${manufacturerName}" was successfully updated.`
            );
        } catch (mailErr) {
            console.error("Mail send failed:", mailErr);
        }

        res.status(200).send("manufacturer updated successfully");
    } catch (err) {
        req.log.error("Database update error:", err);
        res.status(500).send("Database update error");
    }
}

async function manufacturerDelete(req, res) {
    const manufacturerId = req.params.manufacturerId;

    try {
        const [rows] = await req.db.execute(query.DELETE_manufacturer, [manufacturerId]);

        try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "deleted Successfully",
            );
        } catch (mailerr) {
            req.log.error("Mail send error", mailerr);
        }
        res.status(200).send("manufacturer deleted successfully");
    } catch (err) {
        console.error("Database delete error:", err);
        res.status(500).send("Database delete error");
    }
}                                                        












function setupRoutes(app){
  app.get("/manufacturer",manufacturerForm);

  app.post("/api/manufacturer",manufacturerCreate)

  app.get("/manufacturer/list",manufacturerList)

   app.get("/api/manufacturer/list", manufacturerListJson);

   app.put("/api/manufacturer/:manufacturerId", manufacturerUpdate);

    app.get("/api/manufacturer/:manufacturerId", getmanufacturerJsonById);

    app.get("/manufacturer/:manufacturerId", manufacturerForm);

    app.delete("/api/manufacturer/:manufacturerId", manufacturerDelete);
}

module.exports = {
    setupRoutes,
};