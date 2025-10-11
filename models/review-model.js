const pool = require("../database/")

/* ***********************
 *  Add new review
 * ******************** */
async function addReview(review) {
    try {
      const sql = `INSERT INTO review (inv_id, account_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *`;
      
      const values = [
      review.inv_id,
      review.account_id,
      review.rating,
      review.comment
    ];
      const result = await pool.query(sql, values)
      return result
    } catch (error) {
        return error.message
    }
}

/* *********************************
 * Get approved reviews by review id
 ******************************** */
async function getApprovedReviews(inv_id) {
    try {
        const sql =
            `SELECT *
            FROM review
            WHERE inv_id = $1
            AND status = 'Approved'
            ORDER BY created_at DESC;
            `;
        const result = await pool.query(sql, [inv_id])
        return result.rows // return all approved reviews for this inventory item
    } catch (error) {
        return error.message
    }
}

/* *******************
 * Get pending reviews
 ****************** */
async function getPendingReviews() {
    try {
        const sql =
            `SELECT *
            FROM review
            WHERE status = 'Pending'
            ORDER BY created_at DESC;
            `;
        const result = await pool.query(sql)
        return result.rows // return all pending reviews for admins
    } catch (error) {
        return error.message
    }
}

/* ********************
 * Update review status
 ******************* */
async function updateReviewStatus(review_id, status) {
    try {
        const sql =
            `UPDATE review
            SET status = $1
            WHERE review_id = $2
            RETURNING *;
            `;
        const result = await pool.query(sql, [status, review_id])
        return result.rows[0]
    } catch (error) {
        return error.message
    }
}

module.exports = { addReview, getApprovedReviews, getPendingReviews, updateReviewStatus };