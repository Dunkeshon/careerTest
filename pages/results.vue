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
      
      <!-- Detailed CS Areas Information (for PDF) -->
      <div id="detailed-cs-areas" class="mt-12 pdf-only">
        <h2 class="text-3xl font-bold mb-6 text-gray-800 text-center">Detailed Information - Recommended Computer Science Areas</h2>
        
        <div v-for="area in recommendedAreas" :key="area.code" class="mb-8 bg-white border-2 border-gray-200 rounded-xl p-6">
          <h3 class="text-xl font-bold mb-4 text-purple-700">{{ getAreaFullName(area.code) }}</h3>
          
          <!-- Key Dispositions -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <span class="text-yellow-500">⭐</span>
              Key Dispositions
            </h4>
            <ul class="space-y-2">
              <li v-for="disposition in getAreaDispositions(area.code)" :key="disposition.name" class="text-sm text-gray-700">
                <strong class="text-gray-900">{{ disposition.name }}:</strong> {{ disposition.description }}
              </li>
            </ul>
          </div>
          
          <!-- Area Description -->
          <div>
            <h4 class="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <span class="text-blue-500">📖</span>
              Area Description
            </h4>
            <div class="space-y-3">
              <p v-for="(paragraph, index) in getAreaDescription(area.code)" :key="index" class="text-sm text-gray-700 leading-relaxed">
                {{ paragraph }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Share and Retake Test Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200">
        <button @click="downloadPDF" :disabled="isGeneratingPDF" class="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-8 rounded-lg shadow transition flex items-center justify-center gap-2">
          <svg v-if="!isGeneratingPDF" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isGeneratingPDF ? 'Generating PDF...' : 'Download PDF' }}
        </button>
        <button @click="retakeTest" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow transition">Retake Test</button>
      </div>

      <!-- PDF Success Toast -->
      <div v-if="pdfSuccess" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          PDF downloaded successfully!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RiasecChart from '~/components/RiasecChart.vue'
import RiasecRadarChart from '~/components/RiasecRadarChart.vue'
import CSAreaPopup from '~/components/CSAreaPopup.vue'
import descriptionsRaw from '~/server/Descriptions.csv?raw'
const route = useRoute()
const results = ref(null)
const sortedScores = ref([])
const topCategories = ref([])
const selectedComparison = ref('centroid')
const recommendedAreas = ref([])
const popupVisible = ref(false)
const selectedAreaCode = ref(null)
const pdfSuccess = ref(false)
const isGeneratingPDF = ref(false)

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

// CS Areas data with descriptions and dispositions (from CSAreaPopup.vue)
const csAreasData = {
  'AI': {
    name: 'Artificial Intelligence (AI)',
    dispositions: [
      { name: 'Meticulous', description: 'Since attention must be paid to details when implementing AI and machine learning algorithms, students must be meticulous about detail.' },
      { name: 'Persistent', description: 'AI techniques often operate in partially observable environments and optimization processes may have cascading errors from multiple iterations. Getting AI techniques to work predictably takes trial and error, and repeated effort.' },
      { name: 'Inventive', description: 'Applications of AI involve creative problem formulation and application of AI techniques, while balancing application requirements and societal and ethical issues.' },
      { name: 'Responsible', description: 'Applications of AI can have significant impacts on society, affecting both individuals and large populations. This calls for students to understand the implications of work in AI to society.' }
    ]
  },
  'AL': {
    name: 'Algorithmic Foundations (AL)',
    dispositions: [
      { name: 'Meticulous', description: 'As an algorithm is a formal solution to a computational problem, attention to detail is important when developing and combining algorithms.' },
      { name: 'Persistent', description: 'As developing algorithmic solutions to computational problems can be challenging, computer scientists must be resolute in pursuing such solutions.' },
      { name: 'Inventive', description: 'As computer scientists develop algorithmic solutions to real-world problems, they must be inventive in developing solutions to these problems.' }
    ]
  },
  'AR': {
    name: 'Architecture and Organization (AR)',
    dispositions: [
      { name: 'Self-directed', description: 'Students should increasingly become self-motivated to acquire complementary knowledge.' },
      { name: 'Proactive', description: 'Students should exercise control and anticipate issues related to the underlying computer system.' }
    ]
  },
  'DM': {
    name: 'Data Management (DM)',
    dispositions: [
      { name: 'Meticulous', description: 'Those who either access or store data collections must be meticulous in fulfilling data ownership responsibilities.' },
      { name: 'Responsible', description: 'Data are managed responsibly. Protection from unauthorized access as well as prevention of irresponsible use of data is paramount.' },
      { name: 'Collaborative', description: 'Data managers and data users must behave in a collaborative fashion to ensure that the correct data are accessed and used appropriately.' },
      { name: 'Responsive', description: 'The data that get stored and are accessed are always in response to an institutional need/request.' }
    ]
  },
  'FPL': {
    name: 'Foundations of Programming Languages (FPL)',
    dispositions: [
      { name: 'Professional', description: 'Students must demonstrate and apply the highest standards when using programming languages and formal methods to build safe systems.' },
      { name: 'Meticulous', description: 'Attention to detail is essential when using programming languages and applying formal methods.' },
      { name: 'Inventive', description: 'Programming and approaches to formal proofs is inherently a creative process, students must demonstrate innovative approaches.' },
      { name: 'Proactive', description: 'Programmers are responsible for anticipating all forms of user input and system behavior.' },
      { name: 'Persistent', description: 'Students must demonstrate perseverance since the correct approach is not always self-evident.' }
    ]
  },
  'GIT': {
    name: 'Graphics and Interactive Techniques (GIT)',
    dispositions: [
      { name: 'Self-directed', description: 'Graphics hardware and software evolves rapidly. Students need to understand the importance of being a life-long learner.' },
      { name: 'Collaborative', description: 'Graphics developers typically work in diverse teams composed of people with disparate subject matter expertise.' },
      { name: 'Effective communicator', description: 'Communication is critical. Students\' technical communication should be practiced and evaluated.' },
      { name: 'Creative', description: 'Creative problem-solving lies at the core of computer graphics.' }
    ]
  },
  'HCI': {
    name: 'Human-Computer Interaction (HCI)',
    dispositions: [
      { name: 'Adaptable', description: 'An HCI practitioner should be adaptable to address dynamic changes in technology, user needs, and design challenges.' },
      { name: 'Meticulous', description: 'An HCI practitioner should be meticulous in ensuring that their products are both user friendly and meet project objectives.' },
      { name: 'Empathetic', description: 'An HCI practitioner must demonstrate understanding of the user\'s needs.' },
      { name: 'Team-oriented', description: 'The successful HCI practitioner should focus on the success of the team.' },
      { name: 'Inventive', description: 'An HCI practitioner should design solutions that blend past practice, audience needs, and HCI fundamentals creatively.' }
    ]
  },
  'MSF': {
    name: 'Mathematical and Statistical Foundations (MSF)',
    dispositions: [
      { name: 'Growth mindset', description: 'Students should be persuaded that anyone can learn mathematics and that success is not dependent on innate ability.' },
      { name: 'Practice mindset', description: 'Students should understand the nature of "doing" mathematics through practice with problems.' },
      { name: 'Deferred gratification', description: 'Students should be patient to see computing applications of mathematical concepts.' },
      { name: 'Persistence', description: 'Eventually success through persistence is what matters, not immediate understanding.' },
      { name: 'Skepticism and inquiry', description: 'Students should feature skepticism and curiosity about how formulas are established.' }
    ]
  },
  'NC': {
    name: 'Networking and Communication (NC)',
    dispositions: [
      { name: 'Meticulous', description: 'Students must be particular about the specifics of understanding and creating networking protocols.' },
      { name: 'Collaborative', description: 'Students must work together to develop multiple components that interact and respond to failures and threats.' },
      { name: 'Proactive', description: 'Students must predict failures and threats while avoiding reactive modes of operation.' },
      { name: 'Professional', description: 'Students must comply with community needs and regulatory body demands.' },
      { name: 'Responsive', description: 'Students must act swiftly to changes in network configurations and user requirements.' },
      { name: 'Adaptive', description: 'Students need to reconfigure systems under varying modes of operation.' }
    ]
  },
  'OS': {
    name: 'Operating Systems (OS)',
    dispositions: [
      { name: 'Proactive', description: 'Students must anticipate the security and performance implications of how operating systems components are used.' },
      { name: 'Meticulous', description: 'Students must carefully analyze the implications of operating system mechanisms on any project.' }
    ]
  },
  'PDC': {
    name: 'Parallel and Distributed Computing (PDC)',
    dispositions: [
      { name: 'Meticulous', description: 'Students\' attention to detail is essential when applying constructs with non-obvious correctness conditions.' },
      { name: 'Persistent', description: 'Students must be prepared to try alternative approaches when solutions are not self evident.' }
    ]
  },
  'SDF': {
    name: 'Software Development Fundamentals (SDF)',
    dispositions: [
      { name: 'Self-Directed', description: 'Students must seek out solutions to issues on their own using technical forums, FAQs, and discussions.' },
      { name: 'Experimental', description: 'Students must experiment with language features to understand them and prototype solutions.' },
      { name: 'Technical curiosity', description: 'Students must develop interest in understanding how programs are executed and stored in memory.' },
      { name: 'Adaptable', description: 'Students must be willing to learn and use different tools and technologies for software development.' },
      { name: 'Persistent', description: 'Students must continue efforts until bugs are identified and programs work satisfactorily.' },
      { name: 'Meticulous', description: 'Students must pay attention to detail and use orderly processes while programming.' }
    ]
  },
  'SE': {
    name: 'Software Engineering (SE)',
    dispositions: [
      { name: 'Collaborative', description: 'Software engineering is a "team sport" – successful engineers work with others effectively through humility, respect, and trust.' },
      { name: 'Professional', description: 'Software engineering produces technology influencing billions of people, requiring ethical behavior and societal awareness.' },
      { name: 'Communicative', description: 'Successful software projects depend on engineers communicating clearly and regularly to coordinate effectively.' },
      { name: 'Meticulous', description: 'Software engineering requires attention to detail and consistent behavior from everyone on the team.' },
      { name: 'Responsible', description: 'Taking responsibility, following through, and keeping others informed are essential for team success.' }
    ]
  },
  'SEC': {
    name: 'Security (SEC)',
    dispositions: [
      { name: 'Meticulous', description: 'Students need to pay careful attention to details to ensure protection of real-world software systems.' },
      { name: 'Self-directed', description: 'Students must be ready to deal with novel and unforeseeable ways adversaries might launch attacks.' },
      { name: 'Collaborative', description: 'Students must collaborate with others, as collective knowledge and skills are needed to prevent attacks.' },
      { name: 'Responsible', description: 'Students need responsibility when designing, developing, deploying, and maintaining secure systems.' },
      { name: 'Accountable', description: 'Students need to know they will be held accountable if system or data breaches occur.' }
    ]
  },
  'SEP': {
    name: 'Society Ethics and Profession (SEP)',
    dispositions: [
      { name: 'Critically Self-reflective', description: 'Students should inspect their own actions, thoughts, biases, and privileges to discover areas for improvement.' },
      { name: 'Responsive', description: 'Students must quickly and accurately respond to changes in the field and adapt professionally.' },
      { name: 'Proactive', description: 'Students must identify areas of importance in accessibility and inclusion and address them.' },
      { name: 'Culturally Competent', description: 'Students must prioritize working with people from different cultures using inclusive language.' },
      { name: 'Advocative', description: 'Students must foster and promote diversity, equity, inclusion, and accessibility in all work.' },
      { name: 'Responsible', description: 'Students must act responsibly toward all users, stakeholders, colleagues, and society at large.' }
    ]
  },
  'SF': {
    name: 'Systems Fundamentals (SF)',
    dispositions: [
      { name: 'Meticulous', description: 'Students must pay attention to details of different perspectives when learning about and evaluating systems.' },
      { name: 'Adaptive', description: 'Students must be flexible when designing systems, as different systems have different requirements and constraints.' }
    ]
  },
  'SPD': {
    name: 'Specialized Platform Development (SPD)',
    dispositions: [
      { name: 'Self-Directed', description: 'Students should learn new platforms and languages with a growth-oriented mindset and thrive in dynamic environments.' },
      { name: 'Inventive', description: 'Students should demonstrate excellence in designing software architecture within unconventional constraints.' },
      { name: 'Adaptable', description: 'Students should adapt to diverse challenges, showing resilience and proactive approach to changing requirements.' }
    ]
  }
}

// Parse descriptions from CSV
function parseDescriptions(csv) {
  const lines = csv.trim().split('\n')
  const descriptions = {}
  let currentArea = null
  let currentParagraphs = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    
    // Skip empty lines
    if (!line.trim()) continue
    
    // Find the first comma that's not inside quotes
    let commaIndex = -1
    let inQuotes = false
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '"') {
        inQuotes = !inQuotes
      } else if (line[j] === ',' && !inQuotes) {
        commaIndex = j
        break
      }
    }
    
    if (commaIndex === -1) continue
    
    const firstColumn = line.substring(0, commaIndex).trim()
    const secondColumn = line.substring(commaIndex + 1).trim()
    
    // Remove quotes from description if present
    const description = secondColumn.startsWith('"') && secondColumn.endsWith('"') 
      ? secondColumn.slice(1, -1) 
      : secondColumn
    
    if (firstColumn && firstColumn !== '') {
      // Save previous area if exists
      if (currentArea && currentParagraphs.length > 0) {
        descriptions[currentArea] = currentParagraphs
      }
      
      // Start new area
      currentArea = firstColumn
      currentParagraphs = description && description.trim() ? [description] : []
    } else if (currentArea && description && description.trim()) {
      // Add paragraph to current area
      currentParagraphs.push(description)
    }
  }
  
  // Save last area
  if (currentArea && currentParagraphs.length > 0) {
    descriptions[currentArea] = currentParagraphs
  }
  
  return descriptions
}

// Parse the descriptions
const areaDescriptions = parseDescriptions(descriptionsRaw)

// Helper functions for the detailed section
const getAreaFullName = (code) => {
  return csAreasData[code]?.name || `Unknown Area (${code})`
}

const getAreaDispositions = (code) => {
  return csAreasData[code]?.dispositions || []
}

const getAreaDescription = (code) => {
  const areaName = csAreasData[code]?.name
  return areaDescriptions[areaName] || ['No description available.']
}

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

const downloadPDF = async () => {
  try {
    isGeneratingPDF.value = true
    
    // Dynamic import of html2pdf library
    const html2pdf = (await import('html2pdf.js')).default
    
    // Get the main content element (excluding buttons)
    const element = document.querySelector('.max-w-4xl')
    
    // Configure PDF options
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `CS-Career-Assessment-Results-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: false
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    }
    
    // Temporarily hide the buttons section to exclude from PDF
    const buttonsSection = document.querySelector('.border-t.border-gray-200')
    const originalButtonDisplay = buttonsSection?.style.display
    if (buttonsSection) {
      buttonsSection.style.display = 'none'
    }
    
    // Temporarily show the detailed CS areas section for PDF
    const detailedSection = document.querySelector('#detailed-cs-areas')
    const originalDetailedDisplay = detailedSection?.style.display
    if (detailedSection) {
      detailedSection.style.display = 'block'
    }
    
    // Generate and download PDF
    await html2pdf().set(opt).from(element).save()
    
    // Restore original visibility states
    if (buttonsSection) {
      buttonsSection.style.display = originalButtonDisplay || ''
    }
    if (detailedSection) {
      detailedSection.style.display = originalDetailedDisplay || 'none'
    }
    
    // Show success message
    pdfSuccess.value = true
    setTimeout(() => {
      pdfSuccess.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Failed to generate PDF. Please try again.')
  } finally {
    isGeneratingPDF.value = false
  }
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

/* PDF-only section - hidden in web view, visible in PDFs */
.pdf-only {
  display: none;
}

@media print {
  .pdf-only {
    display: block !important;
  }
}
</style> 