const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateReview,
  isloggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const ReviewController = require("../controllers/review.js");
const { verifyCsrf } = require("../utils/csrf.js");

//Reviews post route
router.post(
  "/",
  isloggedIn,
  verifyCsrf,
  validateReview,
  wrapAsync(ReviewController.createReview),
);

//Delete review route
router.delete(
  "/:reviewId",
  isloggedIn,
  verifyCsrf,
  isReviewAuthor,
  wrapAsync(ReviewController.deleteReview),
);

module.exports = router;
