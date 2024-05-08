const Listing = require("../Models/listing")

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.randernewForm = (req, res) => {   
    res.render("listings/new.ejs");
}


module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews",populate: { path: "author"}, }).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exists");
        res.redirect("/listings")
    }
    console.log(listing)
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) => {
    // let {title, description, price, image, country, location} = req.body;
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listings");
}

module.exports.randerEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exists");
        res.redirect("/listings")
    }
    res.render("listings/edit.ejs", { listing });
}

module.exports.updateListing = async (req, res) => {
    // if (!req.body.listing) {
    //     throw new ExpressError(400, "send valid data for listings");
    // }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "listing updated");

    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted");
    console.log(deletedListing);
    res.redirect("/listings");
}