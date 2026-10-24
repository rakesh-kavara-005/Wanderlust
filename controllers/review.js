const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

// Create review
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found!");
  }
  const review = new Review(req.body.review);
  review.author = req.user._id;
  await review.save();
  listing.reviews.push(review._id);

  try {
    await listing.save();
  } catch (err) {
    await Review.findByIdAndDelete(review._id);
    throw err;
  }
  req.flash("success", "Review Created!");
  res.redirect(`/listings/${listing._id}`);
};

// Delete review
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};
