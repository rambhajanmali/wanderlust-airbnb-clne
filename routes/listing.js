const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const Listing = require("../Models/listing.js")
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js")
const multer = require('multer');
const { storage } = ("../cloudconfig.js")
const upload = multer({ storage });

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
       
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );


//new route

router.get("/new", isLoggedIn, (listingController.randernewForm));

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//edit route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.randerEditForm));


module.exports = router;