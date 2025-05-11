<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
    <div class="max-w-md mx-auto">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="h-2 bg-gray-200 rounded-full">
          <div 
            class="h-2 bg-blue-600 rounded-full transition-all duration-300"
            :style="{ width: `${(activeIndex / questions.length) * 100}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          Question {{ activeIndex + 1 }} of {{ questions.length }}
        </p>
      </div>

      <!-- Scrollable List of Questions -->
      <div>
        <QuestionCard
          v-for="(question, idx) in questions"
          :key="idx"
          :question="question"
          :value="answers[idx]"
          :active="activeIndex === idx"
          :index="idx"
          @update:value="onAnswer(idx, $event)"
          @activate="setActive"
        />
      </div>

      <!-- Submit Button -->
      <div v-if="isAllQuestionsAnswered" class="flex justify-center mt-8">
        <button 
          @click="submitAnswers"
          class="px-8 py-4 bg-green-600 text-white rounded-xl text-lg font-semibold shadow-lg hover:bg-green-700 transition-colors duration-200"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import QuestionCard from '~/components/QuestionCard.vue'

const questions = ref([])
const answers = ref([])
const activeIndex = ref(0)
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

function setActive(idx) {
  activeIndex.value = idx
}

function onAnswer(idx, rating) {
  answers.value[idx] = rating
  // Animate to next unanswered question
  const nextIdx = answers.value.findIndex((a, i) => a === null && i > idx)
  if (nextIdx !== -1) {
    setTimeout(() => setActive(nextIdx), 400)
  } else if (idx < questions.value.length - 1) {
    setTimeout(() => setActive(idx + 1), 400)
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