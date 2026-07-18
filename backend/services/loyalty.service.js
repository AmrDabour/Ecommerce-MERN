/**
 * Calculate earned points based on order total
 * @param {number} orderTotal - The total price of the order
 * @returns {number} Points earned
 */
function calculatePoints(orderTotal) {
  // Reward points (1 point per $1 spent)
  return Math.floor(orderTotal);
}

/**
 * Determine loyalty tier based on total points
 * @param {number} currentPoints - User's current points
 * @returns {string} The loyalty tier (Silver, Gold, Platinum, or Basic)
 */
function determineTier(currentPoints) {
  if (currentPoints >= 5000) return 'Platinum';
  if (currentPoints >= 2000) return 'Gold';
  if (currentPoints >= 500) return 'Silver';
  return 'Bronze';
}

/**
 * Reward a user for a purchase and update their tier
 * @param {Object} user - User document instance
 * @param {number} orderTotal - Total price of the order
 * @returns {number} Points earned from this transaction
 */
function processPurchaseReward(user, orderTotal) {
  const pointsEarned = calculatePoints(orderTotal);
  user.points += pointsEarned;
  user.loyaltyTier = determineTier(user.points);
  return pointsEarned;
}

module.exports = {
  calculatePoints,
  determineTier,
  processPurchaseReward
};
