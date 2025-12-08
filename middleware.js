
const publicRoutes = ['/loginform', '/api/login'];

function checkAuthentication(req, res, next) {
   
    if (publicRoutes.includes(req.path)) {
        return next();
    }

  
    if (req.session.user && req.session.user.id) {
        console.log(`[AUTH] User ${req.session.user.id} accessing ${req.method} ${req.url}`);
        return next();
    }

   
    console.log(`[AUTH] Unauthenticated access attempt: ${req.method} ${req.url}`);
    res.redirect("/loginform");
}


function AlreadyLoggedIn(req, res, next) {
    if (req.session.user && req.session.userId) {
        return res.redirect("/dashboard");
    }
    next();
}

module.exports = {
    checkAuthentication,
    AlreadyLoggedIn
};
