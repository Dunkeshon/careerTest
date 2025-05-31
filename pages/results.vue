<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="results" class="max-w-2xl mx-auto">
      <div class=" mb-6">
        <h1 class="text-3xl font-bold text-center mb-4">Congratulations!</h1>
        <p class="text-lg text-center mb-6">
          You've completed the career assessment test. Based on your answers, your highest scoring category is:
        </p>
        <div class="bg-blue-400 p-8 rounded-xl mb-6 flex flex-col items-center shadow-lg animate-pop">
          <div v-for="category in topCategories" :key="category" class="mb-2 last:mb-0">
            <h2 class="text-3xl font-extrabold text-white text-center drop-shadow">
              {{ getCategoryName(category) }}
            </h2>
            <p class="text-lg text-white text-center mb-2">
              {{ getCategoryDescription(category) }}
            </p>
          </div>
        </div>
        <p class="text-center text-gray-700 font-normal text-lg mb-4">This is where your strengths shine the most!</p>
        <div class="flex justify-center mt-4">
          <button @click="retakeTest" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition">Retake Test</button>
        </div>
      </div>

      <div class="">
        <h2 class="text-2xl font-bold mb-4">Your Scores</h2>
        <div class="space-y-4">
          <div v-for="([category, score], idx) in sortedScores" :key="category" 
               class="flex items-center justify-between p-3 rounded-lg"
               :class="topCategories.includes(category) ? 'bg-blue-50 border-2 border-blue-400' : 'bg-gray-50'">
            <div>
              <span class="font-semibold">{{ getCategoryName(category) }}</span>
              <p class="text-sm text-gray-600">{{ getCategoryDescription(category) }}</p>
            </div>
            <span class="text-xl font-bold" :class="topCategories.includes(category) ? 'text-blue-600' : 'text-gray-700'">
              {{ score }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <h2 class="text-2xl font-bold mb-4">RIASEC Mapping</h2>
        <div class="mb-6 bg-white p-4 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-3">Compare with:</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="option in comparisonOptions" :key="option.value" 
                 class="flex items-center space-x-2">
              <input 
                type="radio" 
                :id="option.value" 
                :value="option.value" 
                v-model="selectedComparison" 
                class="w-4 h-4"
                :class="option.color"
              >
              <label :for="option.value" class="text-sm font-medium">
                {{ option.label }}
              </label>
            </div>
          </div>
        </div>
        <RiasecChart 
          :scores="results.scores" 
          :comparison-mode="selectedComparison"
        />
      </div>
      <div class="mt-6">
        <h2 class="text-2xl font-bold mb-4">RIASEC Radar Chart</h2>
        <RiasecRadarChart :scores="results.scores" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RiasecChart from '~/components/RiasecChart.vue'
import RiasecRadarChart from '~/components/RiasecRadarChart.vue'
const route = useRoute()
const results = ref(null)
const sortedScores = ref([])
const topCategories = ref([])
const selectedComparison = ref('centroid')

// Add comparison options
const comparisonOptions = [
  { 
    label: 'Centroid (Average)', 
    value: 'centroid',
    color: 'text-yellow-500'
  },
  { 
    label: 'Realistic', 
    value: 'R',
    color: 'text-red-600'
  },
  { 
    label: 'Investigative', 
    value: 'I',
    color: 'text-green-600'
  },
  { 
    label: 'Artistic', 
    value: 'A',
    color: 'text-purple-600'
  },
  { 
    label: 'Social', 
    value: 'S',
    color: 'text-yellow-600'
  },
  { 
    label: 'Enterprising', 
    value: 'E',
    color: 'text-orange-600'
  },
  { 
    label: 'Conventional', 
    value: 'C',
    color: 'text-teal-600'
  }
]

// Category descriptions
const categoryInfo = {
  R: {
    name: 'Realistic',
    description: 'Practical, physical, hands-on, mechanical'
  },
  I: {
    name: 'Investigative',
    description: 'Analytical, intellectual, scientific, explorative'
  },
  A: {
    name: 'Artistic',
    description: 'Creative, original, independent, chaotic'
  },
  S: {
    name: 'Social',
    description: 'Helpful, cooperative, supportive, healing'
  },
  E: {
    name: 'Enterprising',
    description: 'Persuasive, leadership, managing, competitive'
  },
  C: {
    name: 'Conventional',
    description: 'Detail-oriented, organized, clerical'
  }
}

const getCategoryName = (category) => categoryInfo[category].name
const getCategoryDescription = (category) => categoryInfo[category].description

const retakeTest = () => {
  navigateTo('/test')
}

onMounted(() => {
  // Get results from route query params
  if (route.query.results) {
    try {
      results.value = JSON.parse(decodeURIComponent(route.query.results))
      // Sort scores descending
      sortedScores.value = Object.entries(results.value.scores).sort((a, b) => b[1] - a[1])
      // Find the highest score
      const maxScore = sortedScores.value[0][1]
      // Find all categories with the highest score
      topCategories.value = sortedScores.value.filter(([cat, score]) => score === maxScore).map(([cat]) => cat)
    } catch (e) {
      console.error('Error parsing results:', e)
    }
  }
})
</script>

<style scoped>
.animate-pop {
  animation: pop-in 0.7s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes pop-in {
  0% { transform: scale(0.7); opacity: 0; }
  80% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}

/* Add styles for radio buttons */
input[type="radio"] {
  accent-color: currentColor;
}

input[type="radio"]:checked + label {
  font-weight: 600;
}
</style> 