// creating a Error class for the app
class ExpressError extends Error{
    constructor(message, statusCode){
        super();
        this.message = message
        this.statusCode = statusCode
    }
}

module.exports = ExpressError