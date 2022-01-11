express = require('express')
const router = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const Review = require('../models/review')
const {reivewSchema} = require('../schemas.js') 

const validateReview = (req, res, next) => {
    const {error} = reivewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(e => e.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params
    // pull: removes the matching reviews with reveiwId from the reveiws array
    await Campground.findByIdAndUpdate(id, {$pull: {reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully Deleted')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router