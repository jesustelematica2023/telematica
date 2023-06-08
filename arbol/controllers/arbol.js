const flash = require("connect-flash");
const Arbol = require("../model/arbol");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken =
    "pk.eyJ1IjoiYmlndmVlenVzIiwiYSI6ImNsZjk3dWhuYjAzODc0M251aDZra2x3YWIifQ.DNAwOhvuwW2bQoJPHLhZmA";
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const User = require("../model/user");
const { cloudinary } = require("../cloudinary/index");

module.exports.index = async(req, res) => {
    const arbols = await Arbol.find({});

    res.render("arbols/index", { arbols });
};

module.exports.new = (req, res) => {
    res.render("arbols/new");
};

module.exports.addArbol = async(req, res, next) => {

    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.arbol.location,
            limit: 5,
        })
        .send();
    const newArbol = new Arbol(req.body.arbol);
    newArbol.geometry = geoData.body.features[0].geometry;
    newArbol.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    newArbol.author = req.user._id;
    await newArbol.save();

    req.flash("listo", "nuevo árbol creado");
    res.redirect(`/arbols/${newArbol._id}`);
};

module.exports.registerUserForm = async(req, res) => {
    res.render("users/register");
};

module.exports.registerUser = async(req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // console.log(registerUser);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("listo", "Bievenido al gestor de arboles");
            res.redirect("/arbols");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("register");
    }
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

module.exports.logoutUser = (req, res) => {
    req.logout(function(err) {
        if (err) {
            req.flash("listo", "");
            return res.redirect("arbols");
        }
        req.flash("listo", ".");
        return res.redirect("/login");
    });
};

module.exports.loginUser = (req, res) => {
    const redirectUrl = req.session.returnTo || "arbols";
    // console.log(redirectUrl);
    req.flash("listo", "Bienvenido");
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.getOneArbol = async(req, res) => {
    const { id } = req.params;
    const arbol = await Arbol.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("author");

    if (!arbol) {
        req.flash("error", "");
        return res.redirect("arbols");
    }

    res.render("arbols/show", { arbol });
};

module.exports.renderEditPage = async(req, res) => {
    const { id } = req.params;
    const arbol = await Arbol.findById(id);
    if (!arbol) {
        req.flash("error", "");
        return res.redirect("arbols");
    }
    res.render("arbols/edit", { arbol });
};

module.exports.updateArbol = async(req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const arbol = await Arbol.findByIdAndUpdate(id, {...req.body.arbol });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    arbol.images.push(...imgs);

    await arbol.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await arbol.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });

    }

    req.flash("perfecto", "se a actualizado Árbol");
    res.redirect(`/Arbols/${arbol._id}`);
};

module.exports.deleteArbol = async(req, res) => {
    const { id } = req.params;
    await Arbol.findByIdAndDelete(id);
    req.flash("perfecto", "Árbol eliminado");
    res.redirect("/arbols");
};