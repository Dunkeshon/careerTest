import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode('your-super-secure-jwt-secret-key-change-this-in-production')

export async function verifyAdminAuth(event) {
  const token = getCookie(event, 'admin-token')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    if (payload.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }
    
    return payload
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }
} 