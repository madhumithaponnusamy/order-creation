const query = require("./category.query")

const DEFAULT_LIMIT = 4

function categoryForm(req, res) {
    const categoryId = req.params?.categoryId || '';
    res.render("categoryForm", { categoryId });
}

const sendMail = require("../mail/mail")

async function categoryCreate(req, res) {
 
    const { categoryName, description } = req.body;

    try {
        console.log("Inserting into DB:", categoryName, description );
        const [result] = await req.db.execute(query.INSERT_category, [
           categoryName, 
           description  
        ]);

       
        try {
            await sendMail(
                "madhumitha0244@gmail.com", 
                "Inserted Successfully",
                `Hello ${categoryName}, Your data has been successfully inserted.`
            );
        } catch (mailErr) {

            req.log.error("Mail send error", mailErr);
            console.log("Mail not sent:", mailErr);
        }

        console.log("Insert result:", result);
        res.status(201).json({
            message: "category added successfully",
            result
        });

    } catch (err) {
       console.error("Database insert error:", err.code, err.sqlMessage);
        req.log.error("Database insert error", err);
          
        res.status(500).send("Database insert error");
    }
}



function categoryList(req, res) {
    res.render("categoryList", { title: "category List" });
}

async function categoryListJson(req, res) {
    try {
        const limit = parseInt(req.query?.limit) || DEFAULT_LIMIT;
        const page = parseInt(req.query?.page) || 1;
        const offset = (page - 1) * limit;

        // Run both queries in parallel
        const [countResult, dataResult] = await Promise.all([
            req.db.query(query.SELECT_ALL_COUNT),
            req.db.query(query.SELECT_ALL_category, [limit, offset])
        ]);

        const totalRecords = countResult[0][0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        const category= dataResult[0];

        res.json({
            category,
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

async function getcategoryJsonById(req, res) {
    const categoryId = req.params.categoryId;
    try {
        const [rows] = await req.db.execute(query.SELECT_ONE, [categoryId]);
        if (rows.length === 0) return res.status(404).json({ error: "categoryId not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
}

async function categoryUpdate(req, res) {
    const categoryId = req.params.categoryId;
    const { categoryName, description  } = req.body;

    try {
        await req.db.execute(query.UPDATE_category, [categoryName, description , categoryId]);

         try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "Category Updated Successfully",
                `Category "${categoryName}" was successfully updated.`
            );
        } catch (mailErr) {
            console.error("Mail send failed:", mailErr);
        }

        res.status(200).send("category updated successfully");
    } catch (err) {
        req.log.error("Database update error:", err);
        res.status(500).send("Database update error");
    }
}

async function categoryDelete(req, res) {
    const categoryId = req.params.categoryId;

    try {
        const [rows] = await req.db.execute(query.DELETE_category, [categoryId]);

        try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "deleted Successfully",
            );
        } catch (mailerr) {
            req.log.error("Mail send error", mailerr);
        }
        res.status(200).send("category deleted successfully");
    } catch (err) {
        console.error("Database delete error:", err);
        res.status(500).send("Database delete error");
    }
}                                                        












function setupRoutes(app){
  app.get("/category",categoryForm);

  app.post("/api/category",categoryCreate)

  app.get("/category/list",categoryList)

   app.get("/api/category/list", categoryListJson);

   app.put("/api/category/:categoryId", categoryUpdate);

    app.get("/api/category/:categoryId", getcategoryJsonById);

    app.get("/category/:categoryId", categoryForm);

    app.delete("/api/category/:categoryId", categoryDelete);
}

module.exports = {
    setupRoutes,
};