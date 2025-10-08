const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// route to registration
router.get("/register", utilities.handleErrors(accountController.buildRegister));

//Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

//Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default account management route
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Route to build the update account info view
router.get(
  "/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))

// Route to process account information update
router.post(
  "/update", utilities.checkLogin, regValidate.updateAccountRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount))
  
// Route to process password change
router.post(
  "/update-password", utilities.checkLogin, regValidate.passwordUpdateRules(), regValidate.checkPasswordData, utilities.handleErrors(accountController.updatePassword))

// Route to logout
router.get("/logout", utilities.handleErrors(accountController.logout))  

module.exports = router;