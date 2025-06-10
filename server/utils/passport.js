import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcryptjs'

const ADMIN_PASSWORD_HASH = '$2a$12$b.Z.ZxnNQP2ZiTUeedAbTOUNumhAFgcykhVYh7/K7T7N2FBmZq6/q' // admin12345

// Configure the local strategy for use by Passport
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
  try {
    // For admin system, we only accept 'admin' as username
    if (username !== 'admin') {
      return done(null, false, { message: 'Invalid username' })
    }

    // Compare the provided password with the hashed password
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    
    if (!isValid) {
      return done(null, false, { message: 'Invalid password' })
    }

    // Return the user object (simplified for admin)
    const user = {
      id: 'admin',
      username: 'admin',
      role: 'admin'
    }

    return done(null, user)
  } catch (error) {
    return done(error)
  }
}))

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser((id, done) => {
  if (id === 'admin') {
    const user = {
      id: 'admin',
      username: 'admin',
      role: 'admin'
    }
    done(null, user)
  } else {
    done(new Error('User not found'))
  }
})

export default passport 