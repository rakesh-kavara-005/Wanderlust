const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const wrapAsync = require("./utils/wrapAsync.js");

module.exports.isloggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in to perform this action!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.isOwner = wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found!");
  }
  if (!listing.owner || !listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing ");
    return res.redirect(`/listings/${id}`);
  }
  next();
});

module.exports.isReviewAuthor = wrapAsync(async (req, res, next) => {
  const { id, reviewId } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found!");
  }
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ExpressError(404, "Review not found!");
  }
  if (
    !listing.reviews.some((reviewIdInListing) =>
      reviewIdInListing.equals(review._id),
    )
  ) {
    throw new ExpressError(404, "Review does not belong to this listing!");
  }
  if (!review.author || !review.author.equals(req.user._id)) {
    throw new ExpressError(403, "You are not the author of this review!");
  }
  next();
});

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
