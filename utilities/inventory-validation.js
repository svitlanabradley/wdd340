const { body, validationResult } = require("express-validator")
const utilities = require(".")
const validate = {}

/* *******************************
*  Classification validation rules
* ***************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name may not contain spaces or special characters.")
  ]
}

/* *************************
*  Check classification data
* *********************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      messages: req.flash("notice"),
      classification_name
    })
    return
  }
  next()
}

/* **************************
*  Inventory validation rules
* ************************ */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please choose a classification."),

    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle make."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle model."),

    body("inv_year")
      .trim()
      .notEmpty()
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be 4 digits."),

    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Price must be a number greater than or equal to 0."),

    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Mileage must be an integer greater than or equal to 0."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Please provide a color."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description."),
  ]
}

/* *************************
*  Check classification data
* *********************** */
validate.checkInventoryData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    // build classification list with the selected id for stickiness
    const classificationList = await utilities.buildClassificationList(classification_id)
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationList,
      errors: errors.array(),
      // sticky values
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }
  next()
}



module.exports = validate