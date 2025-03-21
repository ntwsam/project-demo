const passport = require('passport')
const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const bcrypt = require('bcryptjs')

const Users = require('../models/users.model');
const { processLogin } = require('../utils/socialLogin')

// 📌 ใช้ตรวจสอบ login โดยตรง
passport.use(
    new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await Users.findOne({ where: { email } })
                if (!user) {
                    return done(null, false, { message: '⚠️ Invalid email' })
                }
                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch) {
                    return done(null, false, { message: '⚠️ Invalid password' })
                }
                return done(null, user)
            } catch (err) {
                return done(err)
            }
        }
    )
)

// 📌 Facebook
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
            profileFields: ['id', 'displayName', 'emails'],
        },
        async (accessToken, refreshToken, profile, done) => {
            await processLogin('facebook', profile, done);
        }
    )
)

// 📌 Google
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            await processLogin('google', profile, done);
        }
    )
)

// 📌 GitHub
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
            scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            await processLogin('github', profile, done);
        }
    )
);

// 📌 ใช้หลัง login เก็บข้อมูลใน session
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// 📌 ใช้ร้องขอดึงข้อมูลจาก session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await Users.findByPk(id)
        done(null, user)
    } catch (err) {
        return done(err)
    }
})

module.exports = passport