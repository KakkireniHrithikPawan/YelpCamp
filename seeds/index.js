const mongoose = require('mongoose');
const Campground = require('../models/campground')
const {places, descriptors} = require('./seedHelpers')
const cities = require('./cities')

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("Database Connected");
});

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: '61dda2418d711dc935555820',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit ullam dolor obcaecati dolorum deserunt nulla itaque corporis, nisi, aspernatur dolores minus, est voluptas. Ipsum consequatur aliquid cumque dignissimos doloribus obcaecati?',
            price: price
        })
        await camp.save();
    }
}

seedDB();