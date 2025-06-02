<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="results" class="max-w-4xl mx-auto">
      
      <!-- Main Title -->
      <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">Find your role in computer science</h1>
      
      <!-- Highest Score Section -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">
          You scored the most at <span class="text-blue-600 font-bold">{{ getCategoryName(topCategories[0]) }}</span>
        </h2>
        
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 max-w-2xl mx-auto">
          <div class="text-left space-y-4 text-sm text-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <div :class="{ 'bg-blue-100 p-3 rounded-lg border-2 border-blue-300': topCategories.includes('R') }">
                  <p><strong class="text-red-600">Realistic (R):</strong> Prefers practical, hands-on work using tools, machines, or tangible materials. Tends to value clear procedures and concrete results.</p>
                </div>
                <div :class="{ 'bg-blue-100 p-3 rounded-lg border-2 border-blue-300': topCategories.includes('I') }">
                  <p><strong class="text-green-600">Investigative (I):</strong> Drawn to analytical, scientific, or technical tasks; enjoys solving abstract problems, conducting research, and gathering information.</p>
                </div>
                <div :class="{ 'bg-blue-100 p-3 rounded-lg border-2 border-blue-300': topCategories.includes('A') }">
                  <p><strong class="text-purple-600">Artistic (A):</strong> Favors creative, unstructured activities; likes designing, imagining, and expressing ideas visually or through writing.</p>
                </div>
              </div>
              <div class="space-y-3">
                <div :class="{ 'bg-blue-100 p-3 rounded-lg border-2 border-blue-300': topCategories.includes('S') }">
                  <p><strong class="text-yellow-600">Social (S):</strong> Enjoys helping, teaching, or providing service; finds fulfillment in interpersonal communication and improving others' well-being.</p>
                </div>
                <div :class="{ 'bg-blue-100 p-3 rounded-lg border-2 border-blue-300': topCategories.includes('E') }">
                  <p><strong class="text-orange-600">Enterprising (E):</strong> Motivated by leadership, persuasion, or influencing others; comfortable taking risks, initiating projects, and setting organizational goals.</p>
                </div>
                <div :class="{ 'bg-blue-100 p-3 rounded-lg border-2 border-blue-300': topCategories.includes('C') }">
                  <p><strong class="text-teal-600">Conventional (C):</strong> Seeks structure, order, and clear procedures; prefers working with data, following established rules, and performing detail-oriented tasks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interpreting Results Section -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-3 text-left text-gray-800">Interpreting results</h3>
        <p class="text-gray-700 text-left leading-relaxed">
          We take your RIASEC scores (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) and plot them on a two-dimensional grid defined by "People ↔ Things" (horizontal) and "Data ↔ Ideas" (vertical). Each CS domain has been positioned on that same grid according to its typical tasks—some areas lean more toward hands-on technical work, others toward abstract, creative problem-solving or working directly with people. By comparing where your RIASEC profile lands to where each domain sits, we highlight the computer science fields that best match your interests and strengths.
        </p>
      </div>

      <!-- Exploring Careers Section -->
      <div class="mt-8 mb-8">
        <h2 class="text-2xl font-bold mb-4">Exploring careers</h2>
        <RiasecChart 
          :scores="results.scores" 
          v-model:comparison-mode="selectedComparison"
          @closest-areas-updated="handleClosestAreasUpdate"
        />
        
        <!-- Recommended CS Areas -->
        <div v-if="recommendedAreas.length > 0" class="mt-6">
          <h3 class="text-xl font-semibold mb-3 text-gray-800">Recommended CS Areas</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button 
              v-for="area in recommendedAreas" 
              :key="area.name"
              @click="openAreaPopup(area.code)"
              class="cs-area-btn"
            >
              {{ area.name }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- CS Area Popup -->
      <CSAreaPopup 
        :visible="popupVisible" 
        :area-code="selectedAreaCode" 
        :closest-areas="recommendedAreas"
        @close="closePopup" 
        @navigate="handleAreaNavigation"
      />

      <!-- Results in Depth Section -->
      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Results in depth</h2>
        
        <!-- RIASEC Radar Chart -->
        <div class="mb-6">
          <RiasecRadarChart :scores="results.scores" />
        </div>
        
        <!-- Holland Codes Explanation -->
        <div class="bg-gray-50 p-6 rounded-lg">
          <h4 class="text-lg font-semibold mb-3 text-gray-800">About Holland Codes (RIASEC)</h4>
          <div class="text-gray-700 space-y-4 text-sm leading-relaxed">
            <p>
              Holland Codes (also known as RIASEC) are a framework for understanding people's vocational interests and personalities in relation to work environments. Developed by psychologist John L. Holland in the 1950s, the theory posits that both individuals and work settings can be grouped into six broad types. By matching a person's top interest‐types (their "Holland codes") with similar work environments, one can predict job satisfaction, performance, and career fit.
            </p>
            
            <div>
              <h5 class="font-semibold text-gray-800 mb-2">The Core Idea</h5>
              <ul class="list-disc list-inside space-y-2 ml-4">
                <li><strong>People Have Distinct Interest Patterns:</strong> Holland observed that most individuals gravitate toward certain activities and tasks—some enjoy hands‐on mechanical work, others prefer creative expression, still others seek helping professions, and so on.</li>
                <li><strong>Work Environments Also Have "Styles":</strong> Just as people vary, so do workplaces. Some jobs involve mostly data and analysis, others emphasize teamwork or creative problem‐solving, and others demand precise, detail‐oriented tasks.</li>
                <li><strong>"Like Attracts Like":</strong> When a person's interest pattern (their Holland code) closely matches the "style" of their work environment, they tend to be more engaged, productive, and satisfied. Conversely, a mismatch often leads to low motivation and high turnover.</li>
              </ul>
            </div>
            
            <p>
              Holland boiled interests down to six fundamental categories—each represented by a letter. That's why his model is often called "RIASEC", after the initials of the six types.
            </p>
          </div>
        </div>
        
        <!-- Detailed Scores -->
        <div class="mt-6">
          <h4 class="text-lg font-semibold mb-3 text-gray-800">Your detailed scores</h4>
          <div class="space-y-3">
            <div v-for="([category, score], idx) in sortedScores" :key="category" 
                 class="flex items-center justify-between p-4 rounded-lg"
                 :class="topCategories.includes(category) ? 'bg-blue-50 border-2 border-blue-400' : 'bg-gray-50'">
              <div class="flex-1">
                <span class="font-semibold text-lg">{{ getCategoryName(category) }}</span>
                <p class="text-sm text-gray-600">{{ getCategoryDescription(category) }}</p>
              </div>
              <div class="text-right">
                <span class="text-2xl font-bold" :class="topCategories.includes(category) ? 'text-blue-600' : 'text-gray-700'">
                  {{ score }}
                </span>
                <p class="text-xs text-gray-500">/ 32</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Retake Test Button -->
      <div class="flex justify-center mt-8 pt-6 border-t border-gray-200">
        <button @click="retakeTest" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow transition">Retake Test</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RiasecChart from '~/components/RiasecChart.vue'
import RiasecRadarChart from '~/components/RiasecRadarChart.vue'
import CSAreaPopup from '~/components/CSAreaPopup.vue'
const route = useRoute()
const results = ref(null)
const sortedScores = ref([])
const topCategories = ref([])
const selectedComparison = ref('centroid')
const recommendedAreas = ref([])
const popupVisible = ref(false)
const selectedAreaCode = ref(null)

// Updated category descriptions to match the new format
const categoryInfo = {
  R: {
    name: 'Realistic',
    description: 'Prefers practical, hands-on work using tools, machines, or tangible materials'
  },
  I: {
    name: 'Investigative',
    description: 'Drawn to analytical, scientific, or technical tasks; enjoys solving abstract problems'
  },
  A: {
    name: 'Artistic',
    description: 'Favors creative, unstructured activities; likes designing and expressing ideas'
  },
  S: {
    name: 'Social',
    description: 'Enjoys helping, teaching, or providing service; finds fulfillment in interpersonal communication'
  },
  E: {
    name: 'Enterprising',
    description: 'Motivated by leadership, persuasion, or influencing others; comfortable taking risks'
  },
  C: {
    name: 'Conventional',
    description: 'Seeks structure, order, and clear procedures; prefers working with data'
  }
}

const getCategoryName = (category) => categoryInfo[category].name
const getCategoryDescription = (category) => categoryInfo[category].description

const retakeTest = () => {
  navigateTo('/test')
}

const handleClosestAreasUpdate = (areas) => {
  recommendedAreas.value = areas
}

const openAreaPopup = (code) => {
  selectedAreaCode.value = code
  popupVisible.value = true
}

const closePopup = () => {
  selectedAreaCode.value = null
  popupVisible.value = false
}

const handleAreaNavigation = (code) => {
  selectedAreaCode.value = code
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

/* CS Area buttons */
.cs-area-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cs-area-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.cs-area-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style> 