<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
    <div class="max-w-md mx-auto">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="h-2 bg-gray-200 rounded-full">
          <div 
            v-if="!isLoading"
            class="h-2 bg-blue-600 rounded-full transition-all duration-300"
            :style="{ width: `${(answeredCount / questions.length) * 100}%` }"
          ></div>
          <div 
            v-else
            class="h-2 bg-gray-200 rounded-full animate-pulse"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          <template v-if="isLoading">
            <span class="animate-pulse">Loading questions...</span>
          </template>
          <template v-else>
            Question {{ answeredCount + 1 }} of {{ questions.length }}
          </template>
        </p>
      </div>

      <!-- Paginated List of Questions -->
      <div
        ref="questionListRef"
      >
        <template v-if="isLoading">
          <div class="question-card bg-white rounded-2xl shadow-lg mb-8 mx-auto p-6">
            <div class="animate-pulse">
              <!-- Image placeholder -->
              <div class="h-[350px] bg-gray-200 rounded-xl mb-4"></div>
              <!-- Question text placeholder -->
              <div class="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-8"></div>
              <!-- Answer buttons placeholder -->
              <div class="flex justify-between items-center w-full max-w-xs mx-auto gap-2">
                <div v-for="n in 5" :key="n" class="w-16 h-16 flex items-center justify-center">
                  <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <!-- Labels placeholder -->
              <div class="flex justify-between w-full max-w-xs mx-auto mt-2">
                <div class="h-4 bg-gray-200 rounded w-20"></div>
                <div class="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
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
                class="px-8 py-3 text-lg font-semibold rounded-xl transition-colors duration-200 shadow-md w-[120px] h-[48px]"
                :class="isPageComplete ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
              >
                Next
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Submit Button -->
      <div v-if="isLastPage" class="flex justify-center mt-8">
        <div
          class="question-card inactive-card flex items-center justify-center mb-8 mx-auto"
          style="max-width: 320px; min-height: 200px; height: 200px;"
          ref="submitButtonRef"
        >
          <div class="flex items-center justify-center w-full h-full">
            <button 
              @click="submitAnswers"
              :disabled="!isAllQuestionsAnswered"
              class="px-8 py-3 text-lg font-semibold rounded-xl transition-colors duration-200 shadow-md w-[120px] h-[48px]"
              :class="isAllQuestionsAnswered ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import QuestionCard from '~/components/QuestionCard.vue'

const PAGE_SIZE = 8
const questions = ref([])
const answers = ref([])
const activeIndex = ref(0)
const page = ref(0)
const isLoading = ref(true)
const nextButtonRef = ref(null)
const questionListRef = ref(null)
const submitButtonRef = ref(null)
const progressBarRef = ref(null)

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to generate random answer (1-5)
function getRandomAnswer() {
  return Math.floor(Math.random() * 5) + 1
}

// Function to answer first 41 questions randomly
function answerFirst41Randomly() {
  for (let i = 0; i < 41; i++) {
    answers.value[i] = getRandomAnswer()
  }
  // Go to last page
  page.value = Math.floor((questions.value.length - 1) / PAGE_SIZE)
  setActive(pageStart.value)
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

onMounted(async () => {
  try {
    const response = await fetch('/only questions.csv')
    const text = await response.text()
    const questionsList = text.split('\n').filter(q => q.trim())
    questions.value = shuffleArray(questionsList)
    answers.value = new Array(questions.value.length).fill(null)
    isLoading.value = false

    // Add keyboard event listener
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'q') {
        answerFirst41Randomly()
      }
    })
  } catch (error) {
    console.error('Error loading questions:', error)
  }
})

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'q') {
      answerFirst41Randomly()
    }
  })
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
    setTimeout(() => setActive(nextIdx), 200)
  } else if (localIdx < pagedQuestions.value.length - 1) {
    setTimeout(() => setActive(pageStart.value + localIdx + 1), 200)
  } else {
    // If last question on last page is answered, scroll to submit button
    if (isLastPage.value && isAllQuestionsAnswered.value) {
      setTimeout(() => {
        nextTick(() => {
          submitButtonRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }, 200)
    } else {
      // Otherwise scroll to next button
      setTimeout(() => {
        nextTick(() => {
          nextButtonRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }, 200)
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
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