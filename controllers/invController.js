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

module.exports = invCont