const jwt = require("jsonwebtoken")
require("dotenv").config()
const invModel = require("../models/inventory-model")
const Util = {}

/****************************************
 * Constructs the nav HTML unordered list
 ****************************************/
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list += 
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display" class="vehicle-grid">'
    data.forEach(vehicle => { 
      grid += '<li class="vehicle-crd">'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_image 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="name-price">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span class="price">$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* *************************
 * Build vehicle detail HTML
 *************************** */
Util.buildVehicleDetail = async function (vehicleData) {
  let price = new Intl.NumberFormat('en-US').format(vehicleData.inv_price)
  let miles = new Intl.NumberFormat('en-US').format(vehicleData.inv_miles)
  
  return `
    <div class='vehicle-detail'>
      <div class='vehicle-image'>
        <img src='${vehicleData.inv_image}' alt='Image of ${vehicleData.inv_make} ${vehicleData.inv_model}'>
      </div>
      <div class='vehicle-info'>
        <h2>${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}</h2>
        <p><strong>Price: $${price}</strong></p>
        <p><strong>Miles:</strong> ${miles} miles</p>
        <p><strong>Color:</strong> ${vehicleData.inv_color}</p>
        <p>${vehicleData.inv_description}</p>
      </div>
    </div>
  `
}

/* ********************************
 * Build classification select list 
 ******************************* */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ********************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 ********************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt
  if (!token) {
    res.locals.accountData = null
    res.locals.loggedin = 0
    return next()
  }
  
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, decoded) {
      if (err) {
        req.flash("notice", "Please log in")
        res.clearCookie("jwt")
        res.locals.accountData = null;
        res.locals.loggedin = 0;
        return res.redirect("/account/login")
      }
    
      const accountData = {
        account_id: decoded.account_id,
        account_firstname: decoded.account_firstname,
        account_email: decoded.account_email,
        account_type: decoded.account_type || "Customer"
      };

      req.session.accountData = accountData
      req.session.loggedin = 1
     
      res.locals.accountData = accountData
      res.locals.loggedin = 1
      next()
    });
}

/* ****************************************
 * Middleware to check account type
 **************************************** */
Util.checkAccountType = (req, res, next) => {
  const accountType = res.locals.accountData.account_type
  if (accountType === "Employee" || accountType === "Admin") {
    next()
  } else {
    req.flash("notice", "You do not have permission to access this area.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}
  
module.exports = Util