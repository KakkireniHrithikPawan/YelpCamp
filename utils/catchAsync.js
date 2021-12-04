// creating a function such that we don't need to write try, catch in async functions
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}