const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const {email, username, password} = req.body
        const user = new User({email, username})
        const registerUser = await User.register(user, password)

        // we use this inorder to login after registering a new user
        req.login(registerUser, err => {
            if(err) return next()
        })
        req.flash('success', 'Welcome to Yelp Camp!')
        res.redirect('/campgrounds')
    } catch (e){
        req.flash('error', e.message)
        res.redirect('register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back')
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout()
    req.flash('success', 'Good Bye :)')
    res.redirect('/campgrounds')
}