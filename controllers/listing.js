const Listing = require("../models/listing");
const { cloudinary, uploadToCloudinary } = require("../cloudConfig.js");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({
  accessToken: process.env.MAP_TOKEN,
});

// All listings
module.exports.index = async (req, res) => {
  // 1. Search
  const search = (req.query.search || "").trim();
  const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = search
    ? {
        $or: [
          { title: { $regex: safeSearch, $options: "i" } },
          { location: { $regex: safeSearch, $options: "i" } },
        ],
      }
    : {};
  // 2. Price Filtering
  const { minPrice, maxPrice } = req.query;
  if (minPrice && !isNaN(minPrice) && Number(minPrice) >= 0) {
    filter.price = { $gte: Number(minPrice) };
  }
  if (maxPrice && !isNaN(maxPrice) && Number(maxPrice) >= 0) {
    filter.price = {
      ...filter.price,
      $lte: Number(maxPrice),
    };
  }
  // 3. Pagination
  const limit = 9;
  const totalListings = await Listing.countDocuments(filter);
  const totalPages = Math.ceil(totalListings / limit);

  const page = Math.min(
    Math.max(1, parseInt(req.query.page, 10) || 1),
    Math.max(1, totalPages),
  );
  const skip = (page - 1) * limit;
  const allListings = await Listing.find(filter)
    .sort({ _id: 1 })
    .skip(skip)
    .limit(limit);

  // 4. Preserve Search and Filters
  const queryString = new URLSearchParams({
    search,
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
  }).toString();

  // 5. Render
  res.render("listings/index.ejs", {
    allListings,
    search,
    minPrice,
    maxPrice,
    page,
    totalPages,
    queryString,
  });
};

// New form
module.exports.newForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Create listing
module.exports.createListing = async (req, res) => {
  const response = await geocodingClient
    .forwardGeocode({
      query: `${req.body.listing.location}, ${req.body.listing.country}`,
      limit: 1,
    })
    .send();
  if (!response.body.features.length) {
    throw new ExpressError(400, "Invalid location!");
  }
  if (!req.file) {
    throw new ExpressError(400, "Please upload an image!");
  }
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.geometry = response.body.features[0].geometry;

  const result = await uploadToCloudinary(req.file.buffer);
  newListing.image = {
    url: result.secure_url,
    filename: result.public_id,
  };

  try {
    await newListing.save();
  } catch (err) {
    await cloudinary.uploader.destroy(result.public_id).catch(console.error);
    throw err;
  }
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// Show listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate({ path: "owner", select: "username" });
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

// Edit form
module.exports.editForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found!");
  }
  const originalImageUrl = listing.image.url.replace(
    "/upload/",
    "/upload/w_250,c_limit/",
  );
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Update listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found!");
  }
  // Update coordinates only if location changes
  if (
    listing.location !== req.body.listing.location ||
    listing.country !== req.body.listing.country
  ) {
    const response = await geocodingClient
      .forwardGeocode({
        query: `${req.body.listing.location}, ${req.body.listing.country}`,
        limit: 1,
      })
      .send();
    if (!response.body.features.length) {
      throw new ExpressError(400, "Invalid location!");
    }
    listing.geometry = response.body.features[0].geometry;
  }
  listing.set(req.body.listing);
  let oldFilename;
  let newFilename;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    oldFilename = listing.image?.filename;
    newFilename = result.public_id;
    listing.image = {
      url: result.secure_url,
      filename: newFilename,
    };
  }
  try {
    await listing.save();
  } catch (err) {
    if (newFilename) {
      await cloudinary.uploader.destroy(newFilename).catch(console.error);
    }
    throw err;
  }
  if (oldFilename) {
    await cloudinary.uploader.destroy(oldFilename).catch(console.error);
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// Delete listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndDelete(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found!");
  }
  if (listing.image?.filename) {
    await cloudinary.uploader
      .destroy(listing.image.filename)
      .catch(console.error);
  }
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
