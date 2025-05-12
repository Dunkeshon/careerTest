<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
    <div class="max-w-md mx-auto">
      <!-- Progress Bar -->
      <div class="mb-6 ">
        <div class="h-2 bg-gray-200 rounded-full">
          <div 
            class="h-2 bg-blue-600 rounded-full transition-all duration-300"
            :style="{ width: `${(answeredCount / questions.length) * 100}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          Question {{ answeredCount + 1 }} of {{ questions.length }}
        </p>
      </div>

      <!-- Paginated List of Questions -->
      <div
        ref="questionListRef"
      >
        <QuestionCard
          v-for="(question, idx) in pagedQuestions"
          :key="pageStart + idx"
          :question="question"
          :value="answers[pageStart + idx]"
          :active="activeIndex === (pageStart + idx)"
          :index="pageStart + idx"
          :data-question-index="pageStart + idx"
          @update:value="onAnswer(pageStart + idx, $event)"
          @activate="setActive"
        />
        <!-- Next Button as Card -->
        <div
          v-if="!isLastPage"
          class="question-card inactive-card flex items-center justify-center mb-8 mx-auto"
          style="max-width: 320px; min-height: 200px; height: 200px;"
          ref="nextButtonRef"
        >
          <div class="flex items-center justify-center w-full h-full">
            <button
              @click="handleNextClick"
              aria-disabled="!isPageComplete"
              class="px-8 py-3 text-lg font-semibold rounded-xl transition-colors duration-200 shadow-md"
              :class="isPageComplete ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'"
              style="min-width: 120px; min-height: 48px;"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div v-if="isLastPage && isPageComplete" class="flex justify-center mt-8">
        <button 
          @click="submitAnswers"
          :disabled="!isAllQuestionsAnswered"
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

const PAGE_SIZE = 8
const questions = ref([])
const answers = ref([])
const activeIndex = ref(0)
const page = ref(0)
const isLoading = ref(true)
const nextButtonRef = ref(null)
const questionListRef = ref(null)

onMounted(async () => {
  try {
    const response = await fetch('/only questions.csv')
    const text = await response.text()
    questions.value = text.split('\n').filter(q => q.trim())
    answers.value = new Array(questions.value.length).fill(null)
    isLoading.value = false
  } catch (error) {
    console.error('Error loading questions:', error)
  }
})

const pageStart = computed(() => page.value * PAGE_SIZE)
const pageEnd = computed(() => Math.min(pageStart.value + PAGE_SIZE, questions.value.length))
const pagedQuestions = computed(() => questions.value.slice(pageStart.value, pageEnd.value))
const isLastPage = computed(() => pageEnd.value >= questions.value.length)

function setActive(idx) {
  activeIndex.value = idx
}

function onAnswer(idx, rating) {
  answers.value[idx] = rating
  // Animate to next unanswered question on this page
  const localIdx = idx - pageStart.value
  const nextIdx = answers.value.findIndex((a, i) => a === null && i >= pageStart.value && i < pageEnd.value && i > idx)
  if (nextIdx !== -1) {
    setTimeout(() => setActive(nextIdx), 400)
  } else if (localIdx < pagedQuestions.value.length - 1) {
    setTimeout(() => setActive(pageStart.value + localIdx + 1), 400)
  } else {
    // If last on page, scroll to next button
    setTimeout(() => {
      nextTick(() => {
        nextButtonRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }, 400)
  }
}

const isPageComplete = computed(() => {
  for (let i = pageStart.value; i < pageEnd.value; i++) {
    if (answers.value[i] === null) return false
  }
  return true
})

const isAllQuestionsAnswered = computed(() => {
  return answers.value.every(answer => answer !== null)
})

const answeredCount = computed(() => answers.value.filter(a => a !== null).length)

function nextPage() {
  // If not all questions on this page are answered, scroll to the first unanswered
  for (let i = pageStart.value; i < pageEnd.value; i++) {
    if (answers.value[i] === null) {
      setActive(i)
      return
    }
  }
  // Otherwise, go to next page
  page.value++
  setActive(pageStart.value)
  nextTick(() => {
    questionListRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function handleNextClick() {
  if (isPageComplete.value) {
    nextPage()
  } else {
    // Scroll to first unanswered on this page and make it active
    for (let i = pageStart.value; i < pageEnd.value; i++) {
      if (answers.value[i] === null) {
        setActive(i)
        nextTick(() => {
          const el = document.querySelector(`[data-question-index='${i}']`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
        break
      }
    }
  }
}

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
  }
}
</script> 