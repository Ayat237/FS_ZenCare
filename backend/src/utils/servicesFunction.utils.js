
import crypto from "crypto";


export const  capitalizeName= (name) =>{
    if (!name) return name; // Handle empty or null input
  
    return name
      .toLowerCase() 
      .split(" ") 
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) 
      .join(" ");
  }


  // Generate a random password
export const generateRandomPassword = () => {
  // Generate a 12-character random password with letters, numbers, and symbols
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return password;
};