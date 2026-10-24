const express = require("express");
const router = express.Router();
const WrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveReturnTo } = require("../middleware.js");
const UserController = require("../controllers/user.js");
const { verifyCsrf } = require("../utils/csrf.js");
const { authLimiter } = require("../utils/ratelimit.js");

router
  .route("/signup")
  .get(UserController.signupForm)
  .post(authLimiter, verifyCsrf, WrapAsync(UserController.signup));

router
  .route("/login")
  .get(UserController.loginForm)
  .post(
    authLimiter,
    verifyCsrf,
    saveReturnTo,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    UserController.login,
  );

router.post("/logout", verifyCsrf, UserController.logout);

module.exports = router;
