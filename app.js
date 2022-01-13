if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate') // to use layouts which are better than partials
const methodOverride = require('method-override')
const morgan = require('morgan')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')
const session = require('express-session')
const flash = require('connect-flash')
const campgroundRoutes = require('./routers/campgrounds.js')
const reviewRoutes = require('./routers/reviews.js')
const userRoutes = require('./routers/users')
const User = require('./models/user')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoDBStore = require('connect-mongo')
const { create } = require('connect-mongo')

const dbUrl =  process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
const secret = process.env.SECRET || 'thisshouldbeabettersecret'

mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("Database Connected");
});

const app = express();
const sessionConfig = {
    store: mongoDBStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600,
        secret
    }),
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // for safety
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires after one week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(morgan('tiny'))
app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    res.locals.success = req.flash('success')// we can have access to success in all templates
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    next()
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'hrithikkakkireni@gmail.com', username: 'hrithikpawan'})
    const newUser = await User.register(user, 'chicken')
    res.send(newUser)
})

app.get('/', (req, res) => {
    res.redirect('/campgrounds');
});

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', {err})
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});