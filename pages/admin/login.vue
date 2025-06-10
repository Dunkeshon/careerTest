<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Admin Login</h1>
        <p class="text-gray-600 mt-2">Enter your admin credentials to continue</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter username"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter admin password"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Username and password are required'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await $fetch('/api/admin/login', {
      method: 'POST',
      body: { 
        username: username.value,
        password: password.value 
      }
    })

    if (data?.success) {
      await navigateTo('/admin/dashboard')
    }
  } catch (err) {
    error.value = err.statusMessage || 'Login failed'
  } finally {
    loading.value = false
  }
}

// Redirect if already authenticated
onMounted(async () => {
  try {
    await $fetch('/api/admin/questions')
    await navigateTo('/admin/dashboard')
  } catch {
    // Not authenticated, stay on login page
  }
})
</script> 