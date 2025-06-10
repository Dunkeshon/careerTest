import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const ADMIN_PASSWORD_HASH = '$2a$12$b.Z.ZxnNQP2ZiTUeedAbTOUNumhAFgcykhVYh7/K7T7N2FBmZq6/q' // admin12345
const JWT_SECRET = new TextEncoder().encode('your-super-secure-jwt-secret-key-change-this-in-production')

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { password } = body

    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password is required'
      })
    }

    // Compare the provided password with the hashed password
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    
    if (!isValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Create JWT token
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    // Set secure cookie
    setCookie(event, 'admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return { success: true, message: 'Login successful' }
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