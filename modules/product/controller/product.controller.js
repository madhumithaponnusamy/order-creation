const query = require("./product.query")

const DEFAULT_LIMIT = 2

function productForm(req, res) {
    const productId = req.params?.productId || '';
    res.render("productForm", { productId });
}

const sendMail = require("../mail/mail")

async function productCreate(req, res) {
 
   const { productName, productPrice, productStock, categoryId, manufacturerId } = req.body;



    try {
        
        const [result] = await req.db.execute(query.INSERT_product, [
              productName, productPrice, productStock, categoryId, manufacturerId
        ]);

       
        try {
            await sendMail(
                "madhumitha0244@gmail.com", 
                "Inserted Successfully",
                `Hello ${productName}, Your data has been successfully inserted.`
            );
        } catch (mailErr) {

            req.log.error("Mail send error", mailErr);
            console.log("Mail not sent:", mailErr);
        }

        console.log("Insert result:", result);
        res.status(201).json({
            message: "product added successfully",
            result
        });

    } catch (err) {
       console.log("Form Data:", req.body);

        req.log.error("Database insert error", err);
          
        res.status(500).send("Database insert error");
    }
}



function productList(req, res) {
    res.render("productList", { title: "product List" });
}

async function productListJson(req, res) {
    try {
        const limit = parseInt(req.query?.limit) || DEFAULT_LIMIT;
        const page = parseInt(req.query?.page) || 1;
        const offset = (page - 1) * limit;

        // Run both queries in parallel
        const [countResult, dataResult] = await Promise.all([
            req.db.query(query.SELECT_ALL_COUNT),
            req.db.query(query.SELECT_ALL_product, [limit, offset])
        ]);

        const totalRecords = countResult[0][0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        const product= dataResult[0];

        res.json({
            product,
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

async function getproductJsonById(req, res) {
    const productId = req.params.productId;
    try {
        const [rows] = await req.db.execute(query.SELECT_ONE, [productId]);
        if (rows.length === 0) return res.status(404).json({ error: "productId not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
}

async function productUpdate(req, res) {
    const productId = req.params.productId;
    const {  productName, productPrice, productStock, categoryId, manufacturerId } = req.body;

    try {
        await req.db.execute(query.UPDATE_product, [  productName, productPrice, productStock, categoryId, manufacturerId, productId]);

         try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "product Updated Successfully",
                `product "${name}" was successfully updated.`
            );
        } catch (mailErr) {
            console.error("Mail send failed:", mailErr);
        }

        res.status(200).send("product updated successfully");
    } catch (err) {
        req.log.error("Database update error:", err);
        res.status(500).send("Database update error");
    }
}

async function productDelete(req, res) {
    const productId = req.params.productId;

    try {
        const [rows] = await req.db.execute(query.DELETE_product, [productId]);

        try {
            await sendMail(
                "madhumitha0244@gmail.com",
                "deleted Successfully",
                "Product deleted"
            );
        } catch (mailerr) {
            req.log.error("Mail send error", mailerr);
        }
        res.status(200).send("product deleted successfully");
    } catch (err) {
        console.error("Database delete error:", err);
        res.status(500).send("Database delete error");
    }
}                                                        

async function categoryListJson(req, res) {
    try {
        const [rows] = await req.db.query("SELECT categoryId, categoryName FROM category WHERE deletedAt IS NULL");
       
        res.json({ 
            categories: rows,
             totalRecords: rows.length
             });   
    } catch (err) {
        console.error("Error fetching category list:", err);
        res.status(500).json({ error: "Database error" });
    }
}

async function manufacturerListJson(req, res) {
    try {
        const [rows] = await req.db.query(
            "SELECT manufacturerId FROM manufacturer WHERE deletedAt IS NULL"
        );

       res.json({ manufacturers: rows });
    } catch (err) {
        console.error("Error fetch manufacturer:", err);
        res.status(500).json({ error: "Database error" });
    }
}










function setupRoutes(app){
  app.get("/product",productForm);

  app.post("/api/product",productCreate)

  app.get("/product/list",productList)

   app.get("/api/product/list", productListJson);

   app.put("/api/product/:productId", productUpdate);

    app.get("/api/product/:productId", getproductJsonById);

    app.get("/product/:productId", productForm);

    app.delete("/api/product/:productId", productDelete);

    app.get("/api/category/list", categoryListJson);

    app.get("/api/manufacturer/list", manufacturerListJson);
}

module.exports = {
    setupRoutes,
};