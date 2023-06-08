const { arbolSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const User = require("./model/user");
const Arbol = require("./model/arbol");
const Review = require("./model/review");

module.exports.isLoggedIn = async(req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        // console.log("path:", req.path);
        // console.log("URLpath:", req.originalUrl);

        await req.session.save();
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

module.exports.validateArbol = (req, res, next) => {
    const { error } = arbolSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const arbol = await Arbol.findById(id);
    if (!arbol.author.equals(req.user._id)) {
        req.flash("error", "You dont have permission");
        return res.redirect(`/arbols/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You dont have permission");
        return res.redirect(`/arbols/${id}`);
    }
    next();
};