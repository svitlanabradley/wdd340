const express = require("express")
const router = express.Router()
const baseController = require("../controllers/baseController")

router.get("/cause-error", baseController.triggerError)

module.exports = router