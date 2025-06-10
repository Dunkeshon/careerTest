export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware during server-side rendering
  if (process.server) return

  try {
    // Try to access a protected admin endpoint to check authentication
    await $fetch('/api/admin/questions')
  } catch (error) {
    // If authentication fails, redirect to login
    if (error.statusCode === 401) {
      return navigateTo('/admin/login')
    }
    // For other errors, also redirect to login as a safety measure
    return navigateTo('/admin/login')
  }
}) 