const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

/* *******************************************************
 *  Build add review view (render form to submit a review)
 * **************************************************** */
async function buildAddReview(req, res, next) {
    try {
        const nav = await utilities.getNav();
        const { inv_id } = req.params; 

        const vehicleData = await invModel.getVehicleById(inv_id)

        // Add welcome flash message for logged in user
    if (req.session.accountData) {
      req.flash("notice", `Welcome ${req.session.accountData.account_firstname}, write your review for this vehicle!`);
    }

        res.render("review/add-review", {
            title: `Add Review for ${vehicleData.inv_make} ${vehicleData.inv_model}`,
            nav,
            errors: [],
            review: {inv_id},
            vehicleData,
            accountData: req.session.accountData  // logged in user
        });
      } catch (err) {
        next(err);
    } 
}

/* ******************************************
 *  Process submitted review (validate first)
 * *************************************** */
async function addReview(req, res, next) {
    try {
        const nav = await utilities.getNav()
        const { inv_id, account_id, rating, comment } = req.body

        const reviewData = {
            inv_id,
            account_id,
            rating,
            comment,
            status: "Pending",
            created_at: new Date()
        }

        const addResult = await reviewModel.addReview(reviewData)   
        if (addResult) {
            req.flash("notice", `Your review has been submitted and is waiting for approval.`)
            res.status(201).redirect(`/inv/detail/${inv_id}`)
        } else {
            // Failure. Reload form with error
            req.flash("notice", "Sorry, adding review failed. Please try again.")
            res.status(500).render("review/add-review", {
            title: "Add Review",
            nav,
            errors: [],
            review: reviewData,
            })
        }
    } catch (err) {
        next(err)
    }
}
  
/* **********************
 *  Build pending reviews
 * ******************* */
async function buildPendingReviews(req, res, next) {
    try {
        const nav = await utilities.getNav()
        const pendingReviews = await reviewModel.getPendingReviews()

        res.render("review/pending-reviews", {
            title: "Pending Reviews",
            nav,
            reviews: pendingReviews,
            errors: []
        })

    } catch (err) {
        next(err)
    }
}

/* *****************************
 *  Build update review status
 * ************************** */
async function updateReviewStatus(req, res, next) {
    try {
        const { review_id, status } = req.body
        const result = await reviewModel.updateReviewStatus(review_id, status)

        if (result) {
            req.flash("notice", `Review ${status.toLowerCase()} successfully.`)
        }
        res.redirect("/review/pending")
    } catch (err) {
        next(err)
    }
}

module.exports = { buildAddReview, addReview, buildPendingReviews, updateReviewStatus };