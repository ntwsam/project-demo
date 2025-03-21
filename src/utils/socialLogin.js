const Users = require('../models/users.model')
const { v4: uuidV4 } = require('uuid');

async function processLogin(provider, profile, done) {
    try {
        const uuid = uuidV4();
        const email = profile.emails[0].value;
        const username = profile.displayName || profile.username;

        const existingUser = await Users.findOne({ where: { email } })
        if (existingUser) {
            await Users.update(
                { provider, providerId: profile.id, uuid },
                { where: { id: existingUser.id } }
            )
            const updateUser = await Users.findByPk(existingUser.id)
            return done(null, updateUser);
        } else {
            const newUser = await Users.create({
                provider,
                providerId: profile.id,
                uuid,
                email,
                username,
                password: null,
                phone: null,
                role: 'customer',
            })
            return done(null, newUser);
        }
    } catch (err) {
        return done(err)
    }
}

module.exports = processLogin;