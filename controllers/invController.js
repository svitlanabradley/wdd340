const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
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
    const nav = await utilities.getNav()
    const vehicleData = await invModel.getVehicleById(inv_id)
    const vehicleHTML = await utilities.buildVehicleDetail(vehicleData)

    const reviews = await reviewModel.getApprovedReviews(inv_id)
    const reviewsHTML = await utilities.buildReviewsHTML(reviews)
    

    if (!vehicleData) {
      const err = new Error("Vehicle not found")
      err.status = 404
      return next(err)
    }

    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleHTML,
      reviewsHTML,
      vehicleData
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
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      errors: null,
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
      })
    } else {
      // Failure. Reload form with error
      let nav = await utilities.getNav()
      req.flash("notice", "Sorry, adding classification failed.")
      res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
      })
    }
  } catch (err) {
    next(err)
  }
}

/* ***************************
 * Add new inventory view
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
      })
    }
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 * Build update inventory item view
 * ************************** */
invCont.buildUpdateInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inventory_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("inventory/update-inventory", {
      title: "Update " + itemName,
      nav,
      classificationList: classificationSelect,
      errors: null,
      // empty sticky values
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
    inv_id,
  } = req.body
  const updateResult = await invModel.updateInventory(  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
    inv_id,
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/update-inventory", {
    title: "Update " + itemName,
    nav,
    classificationList: classificationSelect,
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
    inv_id,
    })
  }
}

/* ***************************
 * Build delete confirmation view
 * ************************** */
invCont.deleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inventory_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      // empty sticky values
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", `The deletion was successful.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect("/inv/delete/inv_id")
  }
}

module.exports = invCont