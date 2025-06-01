<template>
  <div v-if="isVisible" class="popup-overlay" @click="closePopup" @keydown="handleKeydown" tabindex="0">
    <div class="popup-content" @click.stop>
      <div class="popup-header">
        <h2 class="area-title">
          {{ areaInfo.name }}
          <span v-if="areasList.length > 1" class="position-indicator">
            {{ currentAreaIndex + 1 }} of {{ areasList.length }}
          </span>
        </h2>
        <button class="close-btn" @click="closePopup" title="Close (Esc)">×</button>
      </div>
      
      <div class="popup-body">
        <div class="dispositions-section">
          <h3 class="section-title">
            <Star :size="20" class="section-icon" />
            Key Dispositions
          </h3>
          <ul class="dispositions-list">
            <li v-for="disposition in areaInfo.dispositions" :key="disposition.name" class="disposition-item">
              <strong>{{ disposition.name }}:</strong> {{ disposition.description }}
            </li>
          </ul>
        </div>
        
        <div class="description-section">
          <h3 class="section-title">
            <BookOpen :size="20" class="section-icon" />
            Area Description
          </h3>
          <div class="description-text">
            <p v-for="(paragraph, index) in areaInfo.descriptionParagraphs" :key="index" class="description-paragraph">
              {{ paragraph }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Navigation Footer -->
      <div v-if="areasList.length > 1" class="popup-footer">
        <button 
          class="nav-btn prev-btn" 
          @click="navigateToPrevious" 
          :disabled="!hasPrevious"
          title="Previous Area (←)"
        >
          <ChevronLeft :size="18" class="nav-icon" />
          <span class="nav-text">Previous</span>
        </button>
        
        <div class="navigation-info">
          <span class="nav-position">{{ currentAreaIndex + 1 }} of {{ areasList.length }}</span>
        </div>
        
        <button 
          class="nav-btn next-btn" 
          @click="navigateToNext" 
          :disabled="!hasNext"
          title="Next Area (→)"
        >
          <span class="nav-text">Next</span>
          <ChevronRight :size="18" class="nav-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Star, BookOpen, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import descriptionsRaw from '~/server/Descriptions.csv?raw'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  areaCode: {
    type: String,
    default: ''
  },
  closestAreas: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'navigate'])

const isVisible = computed(() => props.visible)

// Keyboard navigation
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closePopup()
  } else if (event.key === 'ArrowLeft' && hasPrevious.value) {
    navigateToPrevious()
  } else if (event.key === 'ArrowRight' && hasNext.value) {
    navigateToNext()
  }
}

// Focus management for accessibility
watch(isVisible, async (newValue) => {
  if (newValue) {
    await nextTick()
    const popupOverlay = document.querySelector('.popup-overlay')
    if (popupOverlay) {
      popupOverlay.focus()
    }
  }
})

// All available CS area codes in a logical order
const allAreaCodes = ['AI', 'AL', 'AR', 'DM', 'FPL', 'GIT', 'HCI', 'MSF', 'NC', 'OS', 'PDC', 'SDF', 'SE', 'SEC', 'SEP', 'SF', 'SPD']

// Navigation logic
const currentAreaIndex = computed(() => {
  if (props.closestAreas && props.closestAreas.length > 0) {
    // Use closest areas order if available
    const areaNames = props.closestAreas.map(area => area.code || area.name)
    return areaNames.findIndex(code => code === props.areaCode)
  }
  // Fallback to all areas order
  return allAreaCodes.findIndex(code => code === props.areaCode)
})

const areasList = computed(() => {
  if (props.closestAreas && props.closestAreas.length > 0) {
    return props.closestAreas.map(area => area.code || area.name)
  }
  return allAreaCodes
})

const hasPrevious = computed(() => currentAreaIndex.value > 0)
const hasNext = computed(() => currentAreaIndex.value < areasList.value.length - 1)

const navigateToPrevious = () => {
  if (hasPrevious.value) {
    const prevCode = areasList.value[currentAreaIndex.value - 1]
    emit('navigate', prevCode)
  }
}

const navigateToNext = () => {
  if (hasNext.value) {
    const nextCode = areasList.value[currentAreaIndex.value + 1]
    emit('navigate', nextCode)
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

// CS Areas data with descriptions and dispositions
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
    name: 'Operating systems (OS)',
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
    name: 'Software Development Foundamentals (SDF)',
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
    name: 'Systems Foundamentals (SF)',
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

const areaInfo = computed(() => {
  const baseInfo = csAreasData[props.areaCode] || {
    name: 'Unknown Area',
    dispositions: [],
  }
  
  // Get description paragraphs from CSV data
  const descriptionParagraphs = areaDescriptions[baseInfo.name] || ['No description available.']
  
  return {
    ...baseInfo,
    descriptionParagraphs
  }
})

const closePopup = () => {
  emit('close')
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 2rem 1rem;
  overflow-y: auto;
}

.popup-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  margin-top: 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.area-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.position-indicator {
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.9;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.popup-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 0.875rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  gap: 1rem;
}

.nav-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 75px;
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.nav-icon {
  flex-shrink: 0;
}

.nav-text {
  font-size: 0.875rem;
}

.navigation-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  flex: 1;
}

.nav-position {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.popup-body {
  padding: 0.875rem 0.875rem 0.875rem;
  overflow-y: auto;
  flex: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  color: #667eea;
  flex-shrink: 0;
}

.dispositions-section {
  margin-bottom: 2rem;
}

.dispositions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}

.disposition-item {
  background: #f8fafc;
  padding: 0.875rem;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  transition: transform 0.2s, box-shadow 0.2s;
  font-size: 0.875rem;
}

.disposition-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.disposition-item strong {
  color: #1e40af;
  font-weight: 600;
}

.description-section {
}

.description-text {
  background: #f9fafb;
  padding: 0.875rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.description-paragraph {
  line-height: 1.8;
  color: #4b5563;
  font-size: 0.875rem;
  text-align: justify;
  margin-bottom: 1.2rem;
}

.description-paragraph:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .popup-overlay {
    padding: 1rem;
  }
  
  .popup-content {
    margin-top: 1rem;
    max-height: 95vh;
  }
  
  .popup-header {
    padding: 0.75rem 1rem 0.5rem;
  }
  
  .area-title {
    font-size: 1.25rem;
  }
  
  .close-btn {
    width: 28px;
    height: 28px;
    font-size: 1.5rem;
  }
  
  .popup-body {
    padding: 0.75rem 1rem 0.75rem;
  }
  
  .popup-footer {
    padding: 0.625rem 1rem;
    gap: 0.5rem;
  }
  
  .nav-btn {
    padding: 0.5rem 0.875rem;
    min-width: 75px;
    font-size: 0.875rem;
  }
  
  .nav-icon {
    flex-shrink: 0;
  }
  
  .nav-text {
    font-size: 0.875rem;
  }
  
  .navigation-info {
    gap: 0.125rem;
  }
  
  .nav-position {
    font-size: 0.875rem;
  }
}
</style> 