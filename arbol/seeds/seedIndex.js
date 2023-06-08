const mongoose = require("mongoose");
const { places, descriptors } = require("../seeds/seedHelpers");
const Arbol = require("../model/arbol");
const cities = require("../seeds/cities");

mongoose.connect("mongodb://localhost:27017/check-inn", {
    useNewUrlParser: true,
    autoIndex: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "se cayó la conexión"));
db.once("open", () => {
    console.log("Profe la base de datos está conectada :D");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Arbol.deleteMany({});
    for (let i = 0; i < 20; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const arbol = new Arbol({
            author: "6404328e8171f6bc647fbc6a",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ],
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{
                    url: "",
                    filename: "check-Inn.ng/vjqifaj1je6jby8qzodk",
                },
                {
                    url: "",
                    filename: "check-Inn.ng/cxbauxlm6lewclotgbev",
                },
            ],
            description: " ",
            price,
        });
        await arbol.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});