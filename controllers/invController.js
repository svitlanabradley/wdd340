const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ****************************************
 *  Build inventory by classification view
 * ***************************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await
      invModel.getInventoryByClassificationId(classification_id)
    
    if (!data || data.length === 0) {
      const err = new Error("No vehicles found for this classification")
      err.status = 404
      return next(err)
    }

    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (err) {
    next(err)
  } 
}

/* ***************************
 *  Build vehicle detail view
 * *************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id
    const vehicleData = await invModel.getVehicleById(inv_id)

    if (!vehicleData) {
      const err = new Error("Vehicle not found")
      err.status = 404
      return next(err)
    }

    let nav = await utilities.getNav()
    const vehicleHTML = await utilities.buildVehicleDetail(vehicleData)

    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleHTML
    })
  } catch (err) {
    next(err)
  } 
}

/* **********************
 *  Build Management View
 * ******************* */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      messages: req.flash("notice")
    })
  } catch (err) {
    next(err)
  }
}

/* ******************************
 *  Build Add Classification View
 * *************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      messages: req.flash("notice")
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Process Add Classification
 * *************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    const addResult = await invModel.addClassification(classification_name)

    if (addResult) {
      // Success. Rebuild nav to include new classification
      let nav = await utilities.getNav()
      req.flash("notice", `Successfully added classification: ${classification_name}`)
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        messages: req.flash("notice")
      })
    } else {
      // Failure. Reload form with error
      let nav = await utilities.getNav()
      req.flash("notice", "Sorry, adding classification failed.")
      res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
        messages: req.flash("notice")
      })
    }
  } catch (err) {
    next(err)
  }
}

/* ***************************
 * Build Add Inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    // classificationList with no selection
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationList,
      errors: null,
      // empty sticky values
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: "",
    })
  } catch (err) {
    next(err)
  }
}

/* *********************
 * Process Add Inventory
 * ****************** */
invCont.addInventory = async function (req, res, next) {
  try {
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

    // Attempt to add the inventory row
    const addResult = await invModel.addInventory({
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
    })

    if (addResult && addResult.rowCount > 0) {
      // success: rebuild nav so new item/classification is visible and render management
      let nav = await utilities.getNav()
      req.flash("notice", `Successfully added ${inv_make} ${inv_model}.`)
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        messages: req.flash("notice"),
      })
    } else {
      // failure: render add form with message
      let nav = await utilities.getNav()
      req.flash("notice", "Sorry, adding the inventory item failed.")
      const classificationList = await utilities.buildClassificationList(classification_id)
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory Item",
        nav,
        classificationList,
        errors: null,
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
        messages: req.flash("notice"),
      })
    }
  } catch (err) {
    next(err)
  }
}

module.exports = invCont