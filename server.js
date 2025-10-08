/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const cookieParser = require("cookie-parser")
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser")
const errorRoute = require("./routes/errorRoute")
const utilities = require("./utilities/")
const accountRoute = require("./routes/accountRoute")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")

/* **********
 * Middleware
 * ******* */
// Body parser (for form data)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) //for parsing application/x-www-form-urlencoded

// Cookie parser
app.use(cookieParser())

//Express session
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())

// make flash messages available in templates
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

//JWT check
app.use(utilities.checkJWTToken)

//Make login astate available in all views
app.use((req, res, next) => {
  res.locals.loggedin = req.session.loggedin
  res.locals.accountData = req.session.accountData
  next()
})



/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
//Account routes
// app.use("/account", accountRoute)
app.use("/account", require("./routes/accountRoute"))


// Inventory routes
app.use("/inv", inventoryRoute)

app.use(static)

// Index rout
app.get("/", utilities.handleErrors(baseController.buildHome))

// intentional error rout
app.use(errorRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})



app.get("/favicon.ico", (req, res) => res.status(204).end())



/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST

/* *****************************************
 * Log statement to confirm server operation
 **************************************** */
app.listen(port, () => {
  console.log(`app listening on ${port}`)
})


