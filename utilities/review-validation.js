const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const utilities = require(".")
const validate = {}

/* *******************************
*  Review validation rules
* ***************************** */
validate.reviewRules = () => {
  return [
    body("rating")
        .isInt({min: 1, max: 5})
        .withMessage("Rating must be a number between 1 and 5."),
    body("comment")
        .trim()
        .notEmpty()
        .withMessage("Please enter a comment.")
  ]
}

/* *************************
*  Check review data
* *********************** */
validate.checkReviewData = async (req, res, next) => {
    const errors = validationResult(req)
    const nav = await utilities.getNav()
    const { inv_id, rating, comment } = req.body
    if (!errors.isEmpty()) {
        const vehicleData = await invModel.getVehicleById(inv_id)
        res.status(400).render("review/add-review", {
        title: `Add Review for ${vehicleData.inv_make} ${vehicleData.inv_model}`,
        nav,
        errors: errors.array(),
        review: { inv_id, rating, comment },
        vehicleData,
        accountData: req.session.accountData
        })
        return
    }
    next()
}

module.exports = validate