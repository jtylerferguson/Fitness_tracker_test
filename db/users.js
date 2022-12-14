/* eslint-disable no-useless-catch */
const { de } = require("faker/lib/locales");
const client = require("./client");

// database functions

// user functions
async function createUser ({ 
  username, 
  password
}) {
  try {
    const { rows: [user] } = await client.query(`
    INSERT INTO users( username, password)
    VALUES ($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `, [username, password]);
  
delete user.password
  return user 
  } catch (error) {

    console.error(error);
  }
}


async function getUser({ username, password }) {

  const { rows: [user] } = await client.query(
    `SELECT username, password
    FROM users
    WHERE "username"=$1;
    `, [username]);

  if (user.password === password){
    delete user.password;
    return user;
  } else if (!user.password === password) {
    return false
  } 
}

async function getUserById(userId) {
  const { rows: [user] } = await client.query(
       `SELECT id, username
       FROM users
       WHERE "id"=${ userId };
     `);

     if (!user){
       return null;
     }
     delete user.password
     return user;
   }



async function getUserByUsername(userName) {
  try {
    const { rows: [user] } = await client.query(`
    SELECT *
         FROM users
    WHERE username=$1;
    `, [userName]);

       return user;
  } catch (error) {
    throw error;
     }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
