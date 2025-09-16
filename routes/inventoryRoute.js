// Needed Resourses
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// Rout to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;