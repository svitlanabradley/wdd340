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
      messages: req.flash("notice") || [],
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
      messages: req.flash("notice") || [],
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
  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  const nav = await utilities.getNav();

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.redirect("/account/login");
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.render("account/register", {
        title: "Register",
        nav,
        messages: req.flash("notice"),
        errors: [],
        account_firstname,
        account_lastname,
        account_email
      });
    }
  } catch (error) {
    req.flash("notice", "Error processing registration. Try again.");
    return res.render("account/register", {
      title: "Register",
      nav,
      messages: req.flash("notice"),
      errors: [],
      account_firstname,
      account_lastname,
      account_email
    });
  }
}

/* *************
*  Process Login
* *********** */
async function loginUser(req, res) {
  const { account_email, account_password } = req.body;
  const nav = await utilities.getNav();

  try {
    const accountData = await accountModel.getAccountByEmail(account_email);

    if (!accountData) {
      return res.render("account/login", {
        title: "Login",
        nav,
        messages: [],
        errors: [{ msg: "Email or password incorrect" }],
        account_email
      });
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (!passwordMatch) {
      return res.render("account/login", {
        title: "Login",
        nav,
        messages: [],
        errors: [{ msg: "Email or password incorrect" }],
        account_email
      });
    }

    // successful login — set session
    req.session.account = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email
    };

    req.flash("notice", `Welcome back, ${accountData.account_firstname}!`);
    res.redirect("/account/dashboard"); // or another protected page
  } catch (error) {
    return res.render("account/login", {
      title: "Login",
      nav,
      messages: [],
      errors: [{ msg: "Error logging in. Try again." }],
      account_email
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, loginUser };














// const accountModel = require("../models/account-model") 
// const utilities = require("../utilities/")
// const bcrypt = require("bcryptjs")

// /* ******************
// *  Deliver login view
// * ******************* */
// async function buildLogin(req, res, next) {
//   let nav = await utilities.getNav()
//   res.render("account/login", {
//     title: "Login",
//     nav,
//     errors: null,
//     messages: req.flash("notice"),
//   })
// }

// /* *************************
// *  Deliver registration view
// * *********************** */
// async function buildRegister(req, res, next) {
//   let nav = await utilities.getNav()
//   res.render("account/register", {
//     title: "Register",
//     nav,
//     errors: null,
//     messages: req.flash("notice"),
//   })
// }

// /* ********************
// *  Process Registration
// * ****************** */
// async function registerAccount(req, res) {
//   let nav = await utilities.getNav()
//   const { account_firstname, account_lastname, account_email, account_password } = req.body
  
// // Hash the password before storing
//   let hashedPassword
//   try {
//     // regular password and cost (salt is generated automatically)
//     hashedPassword = await bcrypt.hashSync(account_password, 10)    
//   } catch (error) {
//     req.flash("notice", 'Sorry, there was an error processing the registration.')
//     res.status(500).render("account/register", {
//       title: "Registration",
//       nav,
//       errors: null,
//     })
//   }

//   const regResult = await accountModel.registerAccount(
//     account_firstname,
//     account_lastname,
//     account_email,
//     hashedPassword
//   )

//   if (regResult) {
//     req.flash(
//       "notice",
//       `Congratulations, you\'re registered ${account_firstname}. Please log in.`
//     )
//     res.status(201).render("account/login", {
//       title: "Login",
//       nav,
//     })
//   } else {
//     req.flash("notice", "Sorry, the registration faild.")
//     res.status(501).render("account/register", {
//       title: "Registration",
//       nav,
//     })
//   }
// }

// /* *************
// *  Process Login
// * *********** */
// async function loginUser(req, res, next) {
//   try {
//     const { account_email, account_password } = req.body
//     const accountData = await accountModel.getAccountByEmail(account_email)

//     if (!accountData) {
//       let nav = await utilities.getNav()
//       return res.render("account/login", {
//         title: "Login",
//         nav,
//         errors: [{ msg: "Email or password incorrect" }],
//         account_email
//       })
//     }

//     const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
//     if (!passwordMatch) {
//       let nav = await utilities.getNav()
//       return res.render("account/login", {
//         title: "Login",
//         nav,
//         errors: [{ msg: "Email or password incorrect" }],
//         account_email
//       })
//     }

//     // login successful — set session
//     req.session.account = {
//       account_id: accountData.account_id,
//       account_firstname: accountData.account_firstname,
//       account_lastname: accountData.account_lastname,
//       account_email: accountData.account_email
//     }

//     res.redirect("/account/dashboard") // or another protected page

//   } catch (error) {
//     next(error)
//   }
// }

  
// module.exports = { buildLogin, buildRegister, registerAccount, loginUser }