// Needed Resourses
const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidate = require("../utilities/review-validation")

// Route to build add review view
router.get("/add/:inv_id",
    utilities.checkLogin,
    utilities.handleErrors(reviewController.buildAddReview)
)

// Route to process submitted review
router.post("/add",
    utilities.checkLogin,
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    utilities.handleErrors(reviewController.addReview)
)

// Route to view pending reviews
router.get(
  "/pending",
  utilities.checkLogin,            
  utilities.handleErrors(reviewController.buildPendingReviews)
);

// Route to update review's status
router.post(
    "/update-status",
    utilities.checkLogin,
    utilities.handleErrors(reviewController.updateReviewStatus)
)

module.exports = router