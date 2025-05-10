<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
    <div class="max-w-md mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          IT Career Path Finder
        </h1>
        <p class="text-gray-600">
          Discover your perfect role in the tech industry
        </p>
      </div>

      <!-- Main Content -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div class="space-y-6">
          <!-- Introduction -->
          <div class="text-center">
            <p class="text-gray-700 mb-4">
              Take our specialized assessment to find your ideal IT career path. 
              Based on the RIASEC model, we'll help you discover roles that match your natural inclinations.
            </p>
          </div>

          <!-- Key Points -->
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 text-sm">1</span>
              </div>
              <p class="text-gray-600">48 quick questions about your preferences</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 text-sm">2</span>
              </div>
              <p class="text-gray-600">Takes about 5-7 minutes to complete</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 text-sm">3</span>
              </div>
              <p class="text-gray-600">Get personalized IT career recommendations</p>
            </div>
          </div>

          <!-- Start Button -->
          <div class="pt-4">
            <button 
              @click="startTest"
              class="w-full bg-blue-600 text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Start Your Career Assessment
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Note -->
      <p class="text-center text-sm text-gray-500">
        Your answers are confidential and will be used only to provide career guidance
      </p>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()

const startTest = () => {
  navigateTo('/test')
}
</script> 