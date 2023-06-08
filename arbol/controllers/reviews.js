const Review = require("../model/review");
const Arbol = require("../model/arbol");

module.exports.addReview = async(req, res) => {
    const arbol = await Arbol.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    arbol.reviews.push(review);
    await review.save();
    await arbol.save();
    req.flash("listo ", "Creado");
    res.redirect(`/arbols/${arbol._id}`);
};

module.exports.deleteReview = async(req, res) => {
    const { id, reviewId } = req.params;
    // console.log(reviewId);
    const arbol = await Arbol.findById(id);
    await Arbol.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("listo ", "Eliminado!");
    res.redirect(`/arbols/${id}`);
};