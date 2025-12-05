const express = require('express');
const app = express();
const PORT = 3006;
const path = require('path');

const rfs = require('rotating-file-stream');
const pino = require('pino');
const pinoHttp = require('pino-http');
const session = require('express-session');

const createDBConnection = require('./db/db')

let db = ""

const generator = (time, testapp) => {
  const d = time || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}.log`;
};

const stream = rfs.createStream(generator, {
  interval: '1d',
  path: path.join(__dirname, 'logs'),
});

const logger = pino(
  { transport: { target: "pino-pretty", options: { colorize: true } } },
  stream
);

app.use(pinoHttp({ logger }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Session middleware: attach `req.session` to incoming requests.
// - `secret` should be set via environment variable in production.
// - `saveUninitialized: false` and `resave: false` are common safe defaults.
// - `cookie.secure` should be true when using HTTPS in production.
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: true,
  // Avoid creating sessions for unauthenticated/anonymous requests.
  // Set to `false` so a session is only saved when it has meaningful data.
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}));
app.use((req, res, next) => {
    console.log("Incoming:", req.method, req.url);
    next();
});

app.set("view engine", "ejs");
app.set("views", [
    path.join(__dirname, "modules", "customer", "views"),
    path.join(__dirname, "modules", "category", "views"),
    path.join(__dirname, "modules", "manufacturer", "views"),
     path.join(__dirname, "modules", "address", "views"),
     path.join(__dirname, "modules", "product", "views"),
    path.join(__dirname, "modules", "order", "views"),
     path.join(__dirname, "modules", "common")
]);


async function startService() {
 db =  await createDBConnection()

app.use((req, res, next) => {
  req.db = db;
  next();
});

const customerController = require("./modules/customer/controller/customer.controller");
customerController.setupRoutes(app)

const categoryController = require("./modules/category/controller/category.controller");
categoryController.setupRoutes(app)


const manufacturerController = require("./modules/manufacturer/controller/manufacturer.controller");
manufacturerController.setupRoutes(app)

const addressController = require("./modules/address/controller/address.controller");
addressController.setupRoutes(app)

const productController = require("./modules/product/controller/product.controller");
productController.setupRoutes(app)

const orderController = require("./modules/order/controller/order.controller");
orderController.setupRoutes(app)



  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startService()