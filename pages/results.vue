<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Your Results</h1>
        <p class="text-gray-600 mb-6">
          Based on your answers, we're analyzing your preferences to suggest the best IT career paths for you.
        </p>
        
        <!-- Placeholder for results -->
        <div class="animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        <!-- Back to Start Button -->
        <div class="mt-8">
          <button 
            @click="goHome"
            class="w-full bg-blue-600 text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const goHome = () => {
  navigateTo('/')
}
</script> 