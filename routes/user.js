const express = require("express");
const router = express.Router();
const WrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveReturnTo } = require("../middleware.js");
const UserController = require("../controllers/user.js");

router
  .route("/signup")
  .get(UserController.signupForm)
  .post(WrapAsync(UserController.signup));

router
  .route("/login")
  .get(UserController.loginForm)
  .post(
    saveReturnTo,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    UserController.login,
  );

router.get("/logout", UserController.logout);

module.exports = router;
