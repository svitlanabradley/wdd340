// Needed Resourses
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId));

// Route to build management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// Route to build add classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification)) 

// Route to process add classification data
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Route to build add inventory form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Route to process add inventory data
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

module.exports = router;