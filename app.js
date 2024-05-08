if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./Models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
// const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js")
// const { url } = require("inspector");
// const Review = require("./Models/review.js")
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");

const secretOption = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.get("/", (req, res) => {
    res.send("hi i am root")
});

app.use(session(secretOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async(req, res) =>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "students",
//     })
//     let registeredUser = await User.register(fakeUser, "hello-world");
//     res.send(registeredUser);
// })

const listingRouter  = require("./routes/listing.js")
const reviewRouter  = require("./routes/review.js");
const userRouter  = require("./routes/user.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});


async function main() {
    await mongoose.connect(MONGO_URL)
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))


app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// app.get("/testListing", async (req, res) =>{
//     let sampleListing = new Listing({
//         title: "my new villa",
//         description: "by the beach",
//         price: 1200,
//         location: "Calungate, goa",
//         country: "india",
//     });

//    await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful listing");
// });

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 505, message = "something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080")
});