<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p class="text-gray-600">Manage question images</p>
          </div>
          <button
            @click="logout"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Default Image Section -->
      <div class="bg-white shadow rounded-lg mb-6 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Default Image</h2>
        <p class="text-gray-600 mb-4">This image is used when no specific image is set for a question.</p>
        
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <img
              v-if="defaultImage"
              :src="defaultImage"
              alt="Default image"
              class="w-20 h-20 object-cover rounded border"
            />
            <div v-else class="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center">
              <span class="text-gray-500 text-xs">No image</span>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <label class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
              Upload Default Image
              <input
                type="file"
                accept="image/png,image/webp,image/jpeg"
                @change="uploadDefaultImage"
                class="hidden"
              />
            </label>
            
            <button
              v-if="defaultImage"
              @click="deleteDefaultImage"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Questions List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Questions</h2>
        </div>
        
        <div v-if="loading" class="p-6 text-center">
          <div class="text-gray-600">Loading questions...</div>
        </div>
        
        <div v-else-if="error" class="p-6 text-center text-red-600">
          {{ error }}
        </div>
        
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="question in questions"
            :key="question['#']"
            class="p-6"
          >
            <div class="flex items-start space-x-4">
              <!-- Question Image -->
              <div class="flex-shrink-0">
                <img
                  v-if="question.imageExists && question.imagePath"
                  :src="question.imagePath"
                  :alt="`Question ${question['#']} image`"
                  class="w-20 h-20 object-cover rounded border"
                />
                <div v-else class="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center">
                  <span class="text-gray-500 text-xs">No image</span>
                </div>
              </div>
              
              <!-- Question Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">
                      Question {{ question['#'] }}
                    </h3>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ question['Question (*when given maximum points (5/5))'] }}
                    </p>
                  </div>
                  
                  <!-- Action Buttons -->
                  <div class="flex space-x-2 ml-4">
                    <label class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium cursor-pointer">
                      Upload
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        @change="uploadQuestionImage($event, question['#'])"
                        class="hidden"
                      />
                    </label>
                    
                    <button
                      v-if="question.imageExists"
                      @click="deleteQuestionImage(question['#'])"
                      class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Upload Progress Modal -->
    <div
      v-if="uploading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="text-center">
          <div class="text-lg font-medium text-gray-900 mb-2">Uploading...</div>
          <div class="text-sm text-gray-600">Please wait while the image is being processed.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  middleware: 'admin-auth'
})

const questions = ref([])
const loading = ref(true)
const error = ref('')
const uploading = ref(false)
const defaultImage = ref('')

// Check for default image
const checkDefaultImage = async () => {
  try {
    const response = await fetch('/images/default/default.webp')
    if (response.ok) {
      defaultImage.value = '/images/default/default.webp'
    }
  } catch {
    defaultImage.value = ''
  }
}

// Load questions
const loadQuestions = async () => {
  try {
    loading.value = true
    const data = await $fetch('/api/admin/questions')
    questions.value = data.questions
  } catch (err) {
    if (err.statusCode === 401) {
      await navigateTo('/admin/login')
    } else {
      error.value = 'Failed to load questions'
    }
  } finally {
    loading.value = false
  }
}

// Upload question image
const uploadQuestionImage = async (event, questionId) => {
  const file = event.target.files[0]
  if (!file) return

  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('questionId', questionId)
    formData.append('imageType', 'question')

    await $fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData
    })

    // Reload questions to update the UI
    await loadQuestions()
    
    // Clear file input
    event.target.value = ''
  } catch (err) {
    alert('Failed to upload image: ' + (err.statusMessage || 'Unknown error'))
  } finally {
    uploading.value = false
  }
}

// Upload default image
const uploadDefaultImage = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('imageType', 'default')

    await $fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData
    })

    await checkDefaultImage()
    
    // Clear file input
    event.target.value = ''
  } catch (err) {
    alert('Failed to upload default image: ' + (err.statusMessage || 'Unknown error'))
  } finally {
    uploading.value = false
  }
}

// Delete question image
const deleteQuestionImage = async (questionId) => {
  if (!confirm('Are you sure you want to delete this image?')) return

  try {
    await $fetch('/api/admin/delete-image', {
      method: 'POST',
      body: { questionId, imageType: 'question' }
    })

    // Reload questions to update the UI
    await loadQuestions()
  } catch (err) {
    alert('Failed to delete image: ' + (err.statusMessage || 'Unknown error'))
  }
}

// Delete default image
const deleteDefaultImage = async () => {
  if (!confirm('Are you sure you want to delete the default image?')) return

  try {
    await $fetch('/api/admin/delete-image', {
      method: 'POST',
      body: { imageType: 'default' }
    })

    defaultImage.value = ''
  } catch (err) {
    alert('Failed to delete default image: ' + (err.statusMessage || 'Unknown error'))
  }
}

// Logout
const logout = async () => {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
    await navigateTo('/admin/login')
  } catch {
    // Force redirect even if logout fails
    await navigateTo('/admin/login')
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([
    loadQuestions(),
    checkDefaultImage()
  ])
})
</script> 