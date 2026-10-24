const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateReview,
  isloggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const ReviewController = require("../controllers/review.js");

//Reviews post route
router.post(
  "/",
  isloggedIn,
  validateReview,
  wrapAsync(ReviewController.createReview),
);

//Delete review route
router.delete(
  "/:reviewId",
  isloggedIn,
  isReviewAuthor,
  wrapAsync(ReviewController.deleteReview),
);

module.exports = router;
