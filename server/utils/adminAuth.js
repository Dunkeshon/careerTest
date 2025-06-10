import { initializeSession } from './session'

export async function verifyAdminAuth(event) {
  // Initialize session and passport
  const { req } = await initializeSession(event)
  
  // Check if user is authenticated via passport session
  if (!req.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }
  
  return req.user
}

// Helper function to check if user is authenticated
export async function isAuthenticated(event) {
  try {
    const { req } = await initializeSession(event)
    return req.user && req.user.role === 'admin'
  } catch {
    return false
  }
} 