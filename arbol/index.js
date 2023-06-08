if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// console.log(process.env.SECRET);

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const ejsMate = require("ejs-mate");
const session = require("express-session");
// const passport = require("passport");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { arbolSchema, reviewSchema } = require("./schemas");
const catchAsync = require("./utils/catchAsync");
const arbolController = require("./controllers/arbol");
const reviewController = require("./controllers/reviews");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const {
    isLoggedIn,
    isAuthor,
    validateArbol,
    validateReview,
    isReviewAuthor,
} = require("./middleware");
const ExpressError = require("./utils/ExpressError");
const { storage } = require("./cloudinary/index");
const multer = require("multer");
const upload = multer({ storage });
const arbol = require("./model/arbol");
const Review = require("./model/review");
const User = require("./model/user");

// live Mongo Db
const mongoUrl =
    "mongodb+srv://root:toor@cluster0.fbrrece.mongodb.net/";

//local database
// "mongodb://localhost:27017/check-inn"

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    autoIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "error en la conexión:"));
db.once("open", () => {
    console.log("Profe ya esta conectada la base de datos :D");
});

app.use(cors());
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const sessionConfig = {
    name: "VizSessions",
    secret: "bettersecret",
    store: MongoStore.create({
        mongoUrl: mongoUrl,
        touchAfter: 24 * 60 * 60,
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: {
            allowOrigins: ["*"],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.currentUser = req.user;
    // console.log(req.user);
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/", cors(), (req, res) => {
    // console.log(req.query);
    res.render("home");
});

app.post("/", upload.array("image"), (req, res) => {
    console.log(req.body, req.file);
    res.send("IT WORKED");
});

app.get("/arbols", catchAsync(arbolController.index));

app.get("/arbols/new", isLoggedIn, arbolController.new);

app.post(
    "/arbols",
    isLoggedIn,
    upload.array("image"),
    catchAsync(arbolController.addArbol)
);

app.get("/register", arbolController.registerUserForm);

app.post("/register", catchAsync(arbolController.registerUser));

app.get("/login", arbolController.renderLogin);

app.get("/logout", arbolController.logoutUser);

app.post(
    "/login",
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
        keepSessionInfo: true,
    }),
    arbolController.loginUser
);

app.get("/arbols/:id", catchAsync(arbolController.getOneArbol));

app.get(
    "/arbols/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(arbolController.renderEditPage)
);

app.put(
    "/arbols/:id",
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateArbol,
    catchAsync(arbolController.updateArbol)
);

app.delete(
    "/arbols/:id",
    isLoggedIn,
    isAuthor,
    catchAsync(arbolController.deleteArbol)
);



app.post(
    "/arbols/:id/reviews",
    isLoggedIn,
    validateReview,
    catchAsync(reviewController.addReview)
);

app.delete(
    "/arbols/:id/reviews/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    catchAsync(reviewController.deleteReview)
);

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found!", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no, Something went wrong!";
    res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
    console.log("Profe iniciare localhost:3000 en el navegador :D");
});
// fixed git config
app.use((res, req, next) => {
    res.header("Access-Control-Allow-Origin", "*");
});

module.exports = app;