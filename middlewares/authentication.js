const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload;
    } catch (error) {}

    return next();
  };
}

// YEH NAYA MIDDLEWARE ADD HUA HAI
function restrictToLoggedInUserOnly(req, res, next) {
    if (!req.user) {
        return res.redirect("/user/signin");
    }
    next();
}


module.exports = {
  checkForAuthenticationCookie,
  restrictToLoggedInUserOnly, // Naye function ko export karein
};