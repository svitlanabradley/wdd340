const jwt = require("jsonwebtoken");
require("dotenv").config();
const accountModel = require("../models/account-model");
const utilities = require("../utilities/");
const bcrypt = require("bcryptjs");

/* ******************
*  Deliver login view
* ******************* */
async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: [],
      account_email: ""
    });
  } catch (err) {
    next(err);
  }
}

/* *************************
*  Deliver registration view
* *********************** */
async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: [],
      account_firstname: "",
      account_lastname: "",
      account_email: ""
    });
  } catch (err) {
    next(err);
  }
}

/* ********************
*  Process Registration
* ****************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  
// Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)    
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: [],
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: []
    })
  } else {
    req.flash("notice", "Sorry, the registration faild.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: []
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      // Redirect to the originally requested page (if any)
      const redirectUrl = req.session.returnTo || "/account"
      delete req.session.returnTo
      return res.redirect(redirectUrl)
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* *****************************
 * Build Account Management View
 * ************************** */
async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: [],
      accountData: res.locals.accountData,
    });
  } catch (err) {
    next(err);
  }
}

/* *****************************
 * Build Update Account View
 * ************************** */
async function buildUpdateAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const account_id = parseInt(req.params.account_id)
    const account = await accountModel.getAccountById(account_id)

    res.render("account/update", {
      title: "Update Account Information",
      nav,
      errors: [],
      accountData: account
    });
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Process update account information
 * ************************************ */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body


  // Debug: check what comes from the form
  console.log("Updating account:", account_firstname, account_lastname, account_email, account_id);

  
  const updatedResult = await accountModel.updateAccountById(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )


// Debug: check what comes back from the database
  console.log("DB result:", updatedResult);



  if (updatedResult) {
    const token = jwt.sign(
      {
        account_id: updatedResult.account_id,
        account_firstname: updatedResult.account_firstname,
        account_email: updatedResult.account_email,
        account_type: updatedResult.account_type
      },
      process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: "1h"}
    )
    res.cookie("jwt", token, { httpOnly: true })
    
    req.flash("notice", `Account information successfully updated.`)
    res.status(201).render("account/management", {
      title: "Account Management",
      nav,
      errors: [],
      accountData: updatedResult
    })
  } else {
    req.flash("notice", "Sorry, update information faild.")
    res.status(501).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: []
    })
  }
}


/* ****************************************
 *  Process update password
 * ************************************ */
async function updatePassword(req, res, next) {
  const { account_password, account_id } = req.body
  
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updatedResult = await accountModel.updatePassword(hashedPassword, account_id)
    
    if (updatedResult.rowCount > 0) {
      req.flash("notice", "Password successfully updated.")
    } else {
      req.flash("notice", "Password update failed.")
    }

    const accountData = await accountModel.getAccountById(account_id)
    const nav = await utilities.getNav()
    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData,
      errors: null,
    })
  } catch(error) {
    req.flash("notice", "There was an error updating the password.")
    const accountData = await accountModel.getAccountById(account_id)
    const nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      accountData,
      errors: null,
    })
  }
}

/* ***************
 *  Process Logout
 * ************ */
async function logout(req, res, next) {
  try {
    res.clearCookie("jwt")

    if (req.session) {
      req.session.loggedin = false
      req.session.accountData = null
  }
  
  req.flash("notice", "You have successfully logged out.")
  return res.redirect("/")
  } catch (error) {
    next(error)
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccount, updateAccount, updatePassword, logout };
