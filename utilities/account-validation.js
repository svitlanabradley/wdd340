const accountModel = require("../models/account-model")
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  *********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registrationRules = () => {
    return [
        // first name is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a first name."),
        
        // last name is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a last name."),
        
        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use different email.")
                }
            }),
        
        // password is required and must be strong password
        body("account_password")
            .trim()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements.")
    ]
}

/* ***************************
 * Login Data Validation Rules
 * *************************** */
validate.loginRules = () => {
    return [
        // valid email is required
        body("account_email")
            .trim()
            .escape()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required."),
        
        // paasword is required
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password is required.")
    ]
}

/* ********************************************************
 * Check data and return errors or continue to registration
 * ***************************************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* ********************************************************
 * Check login data and return errors or continue to login
 * ***************************************************** */
validate.checkLoginData = async (req, res, next) => {
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const { account_email } = req.body
        
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        })
        return
    }
    next()
}

/*  ********************************************
*  Updating account Information Validation Rules
* ******************************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
        .notEmpty()
        .matches(/^[A-Za-zÀ-ÿ' -]+$/)
      .withMessage("First name may only contain letters, spaces, hyphens, or apostrophes."),

    body("account_lastname")
      .trim()
      .escape()
        .notEmpty()
        .matches(/^[A-Za-zÀ-ÿ' -]+$/)
      .withMessage("Last name may only contain letters, spaces, hyphens, or apostrophes."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const existingEmail = await accountModel.checkExistingEmail(account_email)
        const currentAccount = await accountModel.getAccountById(req.body.account_id)

        // only throw an error if the email exists and belongs to a different account
        if (existingEmail && account_email !== currentAccount.account_email) {
          throw new Error("That email is already in use by another account.")
        }
      }),
  ]
}

/*  *********************************
*  Updating password Validation Rules
* ******************************** */
validate.passwordUpdateRules = () => {
    return [
        body("account_password")
            .trim()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements.")
    ]
}

/* ********************************
 * Check update account information
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const accountData = await accountModel.getAccountById(req.body.account_id)
        return res.render("account/update", {
            errors: errors.array(),
            title: "Update Account",
            nav,
            accountData
        })
    }
    next()
}

/* ********************************
 * Check update password information
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const { account_id } = req.body
    const accountData = await accountModel.getAccountById(account_id)

    return res.render("account/update", {
      errors: errors.array(),
      title: "Update Account Information",
      nav,
      accountData
    })
  }
  next()
}

module.exports = validate