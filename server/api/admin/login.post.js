import passport from '~/server/utils/passport'
import { initializeSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username and password are required'
      })
    }

    // Initialize session and passport
    const { req, res } = await initializeSession(event)

    // Authenticate with passport
    const user = await new Promise((resolve, reject) => {
      const authCallback = (err, user, info) => {
        if (err) {
          reject(err)
        } else if (!user) {
          reject(createError({
            statusCode: 401,
            statusMessage: info?.message || 'Invalid credentials'
          }))
        } else {
          resolve(user)
        }
      }

      // Create a mock request object for passport
      const mockReq = {
        ...req,
        body: { username, password }
      }

      passport.authenticate('local', authCallback)(mockReq, res, () => {})
    })

    // Log in the user (serialize to session)
    await new Promise((resolve, reject) => {
      req.logIn(user, (err) => {
        if (err) {
          reject(createError({
            statusCode: 500,
            statusMessage: 'Failed to log in user'
          }))
        } else {
          resolve()
        }
      })
    })

    return { success: true, message: 'Login successful', user: { username: user.username, role: user.role } }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 