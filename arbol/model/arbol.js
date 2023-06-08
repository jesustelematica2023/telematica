const mongoose = require("mongoose");
const Review = require("./review");
mongoose.set("strictQuery", false);
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String,
});

ImageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const arbolSchema = new Schema({
        title: String,
        images: [ImageSchema],
        geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        price: Number,
        description: String,
        location: String,
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        reviews: [{
            type: Schema.Types.ObjectId,
            ref: "Review",
        }, ],
    },
    opts
);

arbolSchema.virtual("properties.popUpMarkup").get(function() {
    return `<a href='/arbols/${this._id}'><h3>${this.title}</h3></a>`;
});

arbolSchema.post("findOneAndDelete", async function(doc) {
    if (doc) {
        await Review.remove({
            _id: {
                $in: doc.reviews,
            },
        });
    }
});

module.exports = mongoose.model("arbol", arbolSchema);