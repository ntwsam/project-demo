const pool = require('../config/mysql.config')
const { v4: uuidV4 } = require('uuid');

async function processLogin(provider, profile, done) {
    try{
        const uuid = uuidV4();
        const email = profile.emails[0].value;
        const username = profile.displayName || profile.username;

        const [existingUser] = await pool.promise().query('SELECT * FROM Users WHERE email = ?',[email]);
        if (existingUser.length > 0) {
            await pool.promise().query('UPDATE Users SET provider = ?, providerId = ?, uuid = ? WHERE id = ?',[
                provider, profile.id,uuid,existingUser[0].id
            ])
            return done(null, existingUser[0]);
        } else {
            const [result] = await pool.promise().query('INSERT INTO Users (provider, providerId, uuid, username, email) VALUES (?, ?, ?, ?, ?)', [
                provider, profile.id,uuid,username,email])
            const [newUser] = await pool.promise().query('SELECT * FROM Users WHERE id = ?', [result.insertId])
            return done(null, newUser[0]);
        }
    }
    catch(err) {
        return done(err)
    }
}

module.exports = processLogin;