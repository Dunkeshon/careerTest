<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
    <div class="max-w-md mx-auto">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="h-2 bg-gray-200 rounded-full">
          <div 
            class="h-2 bg-blue-600 rounded-full transition-all duration-300"
            :style="{ width: `${(currentQuestionIndex / questions.length) * 100}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
        </p>
      </div>

      <!-- Question Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <LikertQuestion
          v-if="questions.length"
          :question="questions[currentQuestionIndex]"
          v-model:value="answers[currentQuestionIndex]"
        />
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between">
        <button 
          v-if="currentQuestionIndex > 0"
          @click="previousQuestion"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200"
        >
          Previous
        </button>
        <div v-else class="w-24"></div>

        <button 
          v-if="currentQuestionIndex < questions.length - 1"
          @click="nextQuestion"
          :disabled="!answers[currentQuestionIndex]"
          :class="[
            'px-6 py-3 rounded-xl transition-colors duration-200',
            answers[currentQuestionIndex]
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          Next
        </button>
        <button 
          v-else
          @click="submitAnswers"
          :disabled="!isAllQuestionsAnswered"
          :class="[
            'px-6 py-3 rounded-xl transition-colors duration-200',
            isAllQuestionsAnswered
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import LikertQuestion from '~/components/LikertQuestion.vue'

const questions = ref([])
const answers = ref([])
const currentQuestionIndex = ref(0)
const isLoading = ref(true)

// Load questions from CSV
onMounted(async () => {
  try {
    const response = await fetch('/only questions.csv')
    const text = await response.text()
    questions.value = text.split('\n').filter(q => q.trim())
    answers.value = new Array(questions.value.length).fill(null)
    isLoading.value = false
  } catch (error) {
    console.error('Error loading questions:', error)
    // Handle error appropriately
  }
})

const selectAnswer = (rating) => {
  answers.value[currentQuestionIndex.value] = rating
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const isAllQuestionsAnswered = computed(() => {
  return answers.value.every(answer => answer !== null)
})

const submitAnswers = async () => {
  try {
    const response = await fetch('/api/submit-answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        answers: answers.value
      })
    })
    const results = await response.json()
    if (results.success) {
      navigateTo('/results')
    }
  } catch (error) {
    console.error('Error submitting answers:', error)
    // Handle error appropriately
  }
}
</script> 