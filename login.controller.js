const query = require("./login.query");
const { checkAuthentication, AlreadyLoggedIn } = require('../middleware/middleware');

//shows login page
function loginForm(req, res) {

  if (req.session.userId) {
    return res.redirect("/dashboard");
  }

  res.render("loginform", {
    title: "Login Page",
    error: null
  });
}


async function handleLogin(req, res) {
  let { email, username, password } = req.body;
  


  //validation

  if (!password || ((!email || email.trim() === "") && (!username || username.trim() === ""))) {
    return res.status(400).render("loginform", {
      title: "Login Page",
      error: "Email/Username and password are required"
    });
  }

  try {

    const querySQL = email ? query.SELECT_USER_BY_EMAIL : query.SELECT_USER_BY_USERNAME;
 const queryParam = email || username;


    if (!queryParam) {
      return res.status(400).render("loginform", {
        title: "Login Page",
        error: "Email/Username cannot be empty"
      });
    }

    const [rows] = await req.db.execute(querySQL, [queryParam]);

    if (rows.length === 0) {
      return res.status(401).render("loginform", {
        title: "Login Page",
        error: "Invalid email/username or password"
      });
    }

    const user = rows[0];


    if (user.password !== password) {
      return res.status(401).render("loginform", {
        title: "Login Page",
        error: "Invalid email/username or password"
      });
    }

    
    req.session.user = {
      userId: user.userId,
      userName: user.userName,
      email: user.email
    };


    console.log(`User logged in: ${user.userName} (ID: ${user.userId})`);

   
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Session save error");
      }
      res.redirect("/dashboard");
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("loginform", {
      title: "Login Page",
      error: "Server error. Please try again."
    });
  }
}


function handleLogout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).send("Logout error");
    }
    res.redirect("/loginform");
  });
}


function dashboard(req, res) {
  if (!req.session.user) {
    return res.redirect("/loginform");
  }

  res.render("dashboard", {
    title: "Dashboard",
    user: req.session.user
  });
}



function setupRoutes(app) {

  app.get("/loginform", AlreadyLoggedIn, loginForm);
  app.post("/api/login", handleLogin);

  app.get("/api/logout", checkAuthentication,handleLogout);

  app.get("/dashboard",checkAuthentication, dashboard);

}

module.exports = {
  setupRoutes
};
