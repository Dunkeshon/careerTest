import { initializeSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  try {
    // Initialize session and passport
    const { req, res } = await initializeSession(event)

    // Use passport logout
    await new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) {
          reject(createError({
            statusCode: 500,
            statusMessage: 'Failed to log out'
          }))
        } else {
          resolve()
        }
      })
    })

    // Destroy the session
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(createError({
            statusCode: 500,
            statusMessage: 'Failed to destroy session'
          }))
        } else {
          resolve()
        }
      })
    })

    return { success: true, message: 'Logged out successfully' }
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