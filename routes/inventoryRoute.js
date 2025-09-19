// Needed Resourses
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Rout to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Rout to build vehicle detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId));

module.exports = router;