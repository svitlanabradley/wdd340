const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}



// Intentional 500 error controller
baseController.triggerError = async function(req, res, next){
  try {
    // create an intentional error
    const error = new Error("Intentional 500 error for testing")
    error.status = 500
    next(error) // pass to error-handling middleware
  } catch (err) {
    next(err)
  }
}




module.exports = baseController