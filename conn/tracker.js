const mysql = require('mysql');

// Database configuration
const pool = mysql.createPool({
  host: 'your_database_host',
  user: 'your_database_user',
  password: 'your_database_password',
  database: 'your_database_name'
});

/**
 * Generates a random tracking number with format: 3 letters + 5 numbers + 3 letters
 * Example: ABC12345XYZ
 */
function generateBaseTrackingNumber() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let result = '';

  // First 3 letters
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // 5 numbers
  for (let i = 0; i < 5; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // Last 3 letters
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  return result;
}

/**
 * Checks if tracking number exists in database
 */
async function isTrackingNumberUnique(trackingNumber) {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT COUNT(*) AS count FROM delivery_tracking WHERE tracking_number = ?',
      [trackingNumber],
      (error, results) => {
        if (error) return reject(error);
        resolve(results[0].count === 0);
      }
    );
  });
}

/**
 * Generates a unique tracking number that doesn't exist in the database
 */
async function generateUniqueTrackingNumber() {
  const MAX_ATTEMPTS = 5;
  let attempts = 0;
  let trackingNumber;

  do {
    trackingNumber = generateBaseTrackingNumber();
    
    // Add timestamp suffix if we've tried multiple times
    if (attempts > 2) {
      trackingNumber += '-' + Date.now().toString().slice(-4);
    }

    const isUnique = await isTrackingNumberUnique(trackingNumber);
    if (isUnique) return trackingNumber;

    attempts++;
  } while (attempts < MAX_ATTEMPTS);

  throw new Error('Failed to generate unique tracking number after multiple attempts');
}

// Export just the generation function
module.exports = generateUniqueTrackingNumber;