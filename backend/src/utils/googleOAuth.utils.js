import client from '../config/OAuth.config.js';

/**
 * Verify Google ID token and get user info
 * @param {string} idToken - Google ID token
 * @returns {Object} - User info (email, name, etc.)
 */
export const verifyGoogleIdToken = async (idToken) => {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      console.log(payload);
      
      return payload;
    } catch (error) {
      throw new Error('Failed to verify ID token: ' + error.message);
    }
  };