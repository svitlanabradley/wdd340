// Needed Resourses
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")


/* ------------ Public Routes (no login required) ------------- */

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId));


/* ----------- Restricted Routes (Employee/Admin only) -------- */

// Route to build management view
router.get("/", utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildManagement))

// Route to build add classification form
router.get("/add-classification", utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification)) 

// Route to process add classification data
router.post(
  "/add-classification", utilities.checkJWTToken, utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification))

// Route to build add inventory form
router.get("/add-inventory", utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory))

// Route to process add inventory data
router.post(
  "/add-inventory", utilities.checkJWTToken, utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory))

// Route to return inventory as JSON
router.get("/getInventory/:classification_id", utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON))


// Route to build the update inventory item view
router.get("/edit/:inventory_id", utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildUpdateInventory))

// Route to update an existing inventory item in the database
router.post("/edit/", utilities.checkJWTToken, utilities.checkAccountType, invValidate.inventoryRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))

// Route to build the delete confirmation view
router.get("/delete/:inventory_id", utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.deleteView)) 

// Route to process the delete inventory item request
router.post("/delete", utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.deleteItem))

module.exports = router;