express = require('express')
const router = express.Router()

const Campground = require('../models/campground')
const {campgroundSchema} = require('../schemas.js') 
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')
const { model } = require('mongoose')

// middleware function
const validateCampground = (req, res, next) => {
    // we use joi to make validations easy
    // creating schema for validation
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(e => e.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

// order matters as new can be considered as id. so, we keep new first
router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})


router.get('/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if(!campground){
        req.flash('error', 'Cannot find that campground!!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
}))

router.get('/:id/edit', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
}))

router.post('/', validateCampground,catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.put('/:id', validateCampground, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))


module.exports = router