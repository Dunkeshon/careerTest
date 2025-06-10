import session from 'express-session'
import passport from './passport'

// Session middleware setup
const sessionMiddleware = session({
  secret: 'your-super-secure-session-secret-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
})

// Function to promisify middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

// Initialize session and passport for an event
export async function initializeSession(event) {
  const req = event.node.req
  const res = event.node.res

  // Initialize session
  await runMiddleware(req, res, sessionMiddleware)

  // Initialize passport
  await runMiddleware(req, res, passport.initialize())
  await runMiddleware(req, res, passport.session())

  return { req, res }
} 