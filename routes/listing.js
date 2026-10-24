const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isloggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listing.js");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WebP images are allowed"));
    }
    cb(null, true);
  },
});

//Index Route ,Create Route
router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isloggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(ListingController.createListing),
  );

//New Route
router.get("/new", isloggedIn, ListingController.newForm);

//Show Route ,Update Route ,Delete Route
router
  .route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(
    isloggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(ListingController.updateListing),
  )
  .delete(isloggedIn, isOwner, wrapAsync(ListingController.deleteListing));

//Edit Route
router.get(
  "/:id/edit",
  isloggedIn,
  isOwner,
  wrapAsync(ListingController.editForm),
);

module.exports = router;
