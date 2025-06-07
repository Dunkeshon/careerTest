<template>
  <div class="riasec-plot-container">
    <div class="toggle-btns">
      <div class="custom-toggle">
        <button 
          :class="['toggle-btn', { active: displayMode === 'closest' }]"
          @click="toggleDisplayMode"
        >
          Most Suitable
        </button>
        <button 
          :class="['toggle-btn', { active: displayMode === 'all' }]"
          @click="toggleDisplayMode"
        >
          Show all
        </button>
      </div>
    </div>
    <div v-if="displayMode === 'closest'" class="match-mode-btns">
      <div class="custom-toggle">
        <button 
          :class="['toggle-btn', { active: matchMode === 'best' }]"
          @click="toggleMatchMode"
        >
          Best match
        </button>
        <button 
          :class="['toggle-btn', { active: matchMode === 'relevance' }]"
          @click="toggleMatchMode"
        >
          By relevance
        </button>
      </div>
    </div>
    <div v-if="displayMode === 'closest' && matchMode === 'relevance'" class="comparison-card">
      <h3 class="comparison-title">Compare with:</h3>
      <div class="comparison-grid">
        <div v-for="option in comparisonOptions" :key="option.value" 
             class="comparison-option">
          <input 
            type="radio" 
            :id="option.value" 
            :value="option.value" 
            v-model="selectedComparison" 
            class="comparison-radio"
          >
          <label :for="option.value" class="comparison-label" :style="{ color: option.color }">
            {{ option.label }}
          </label>
        </div>
      </div>
    </div>
    <div v-if="displayMode === 'closest' && matchMode === 'relevance'" class="lines-checkbox">
      <label><input type="checkbox" v-model="showLines" /> Show lines to closest</label>
    </div>
    <div class="plot-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'
import csAreasRaw from '~/server/cs_areas.csv?raw'

const props = defineProps({
  scores: {
    type: Object,
    default: () => ({})
  },
  comparisonMode: {
    type: String,
    default: 'centroid'
  }
})

const emit = defineEmits(['update:comparisonMode', 'closest-areas-updated'])

// Comparison options for the radio buttons
const comparisonOptions = [
  { 
    label: 'Centroid (Average)', 
    value: 'centroid',
    color: '#eab308'
  },
  { 
    label: 'Realistic', 
    value: 'R',
    color: '#dc2626'
  },
  { 
    label: 'Investigative', 
    value: 'I',
    color: '#16a34a'
  },
  { 
    label: 'Artistic', 
    value: 'A',
    color: '#9333ea'
  },
  { 
    label: 'Social', 
    value: 'S',
    color: '#ca8a04'
  },
  { 
    label: 'Enterprising', 
    value: 'E',
    color: '#ea580c'
  },
  { 
    label: 'Conventional', 
    value: 'C',
    color: '#0d9488'
  }
]

// Debug: Check for duplicates
console.log('Comparison options:', comparisonOptions.map(o => o.label))
console.log('Unique values:', [...new Set(comparisonOptions.map(o => o.value))])

const displayMode = ref('closest')
const matchMode = ref('best')
const showLines = ref(true)
const selectedComparison = ref(props.comparisonMode)
const chartCanvas = ref(null)
let chart = null

// Watch for changes in selectedComparison and emit to parent
watch(selectedComparison, (newValue) => {
  emit('update:comparisonMode', newValue)
})

// Watch for prop changes
watch(() => props.comparisonMode, (newValue) => {
  selectedComparison.value = newValue
})

// RIASEC reference points (6,6 as origin)
const riasecPoints = [
  { x: 6, y: 9, label: 'R' },
  { x: 9, y: 8, label: 'I' },
  { x: 9, y: 4, label: 'A' },
  { x: 6, y: 3, label: 'S' },
  { x: 3, y: 4, label: 'E' },
  { x: 3, y: 8, label: 'C' }
]

// Color mapping for different comparison modes
const comparisonColors = {
  centroid: '#eab308', // yellow-500
  R: '#dc2626', // red-600
  I: '#16a34a', // green-600
  A: '#9333ea', // purple-600
  S: '#ca8a04', // yellow-600
  E: '#ea580c', // orange-600
  C: '#0d9488'  // teal-600
}

// Computed property to get the category with highest user score
const highestScoreCategory = computed(() => {
  const scores = props.scores || {}
  let maxScore = -1
  let maxCategory = 'R'
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      maxCategory = category
    }
  }
  
  return maxCategory
})

// Parse CS Areas CSV
function parseCSAreas(csv) {
  const lines = csv.trim().split('\n')
  const result = []
  for (let i = 1; i < lines.length; i++) {
    const [name, ideas, things] = lines[i].split(',')
    // Map correctly: x-axis = things (People-Things), y-axis = ideas (Data-Ideas)
    result.push({ 
      name: name.trim(), 
      x: Number(things),  // Things value goes to x-axis (People left, Things right)
      y: Number(ideas)    // Ideas value goes to y-axis (Data top, Ideas bottom)
    })
  }
  return result
}

// Function to handle overlapping points by applying small offsets
function handleOverlappingPoints(areas) {
  // Temporarily disable overlapping logic to debug exact matching
  return areas.map(area => ({
    ...area,
    originalX: area.x,
    originalY: area.y
  }))
}

const csAreas = handleOverlappingPoints(parseCSAreas(csAreasRaw))

// Convert RIASEC score (0-32) to plot coordinates (1-11)
const scaleScore = (score, category) => {
  const maxScore = 32
  const center = 6
  const refPoint = riasecPoints.find(p => p.label === category)
  const dx = refPoint.x - center
  const dy = refPoint.y - center
  // For score 32, should land on refPoint; for 0, at center
  const ratio = score / maxScore
  const newX = center + dx * ratio
  const newY = center + dy * ratio
  return { x: newX, y: newY }
}

// Helper: calculate centroid of polygon
function getCentroid(points) {
  let x = 0, y = 0, n = points.length
  for (const p of points) {
    x += p.x
    y += p.y
  }
  return { x: x / n, y: y / n }
}

const createChart = () => {
  // Ensure canvas pixel size matches rendered size (mobile first)
  const wrapper = chartCanvas.value.parentElement;
  const size = Math.min(wrapper.offsetWidth, wrapper.offsetHeight);
  chartCanvas.value.width = size;
  chartCanvas.value.height = size;

  const ctx = chartCanvas.value.getContext('2d')
  const riasecOrder = ['R', 'I', 'A', 'S', 'E', 'C']
  const userPoints = riasecOrder.map(category => {
    const score = props.scores[category] || 0
    const point = scaleScore(score, category)
    return {
      x: point.x,
      y: point.y,
      label: category
    }
  })
  const polygonPoints = [...userPoints, userPoints[0]]
  const centroid = getCentroid(userPoints)

  const getComparisonPoint = () => {
    // When in "Most Suitable" mode and "Best match" is selected, use the highest score category
    if (displayMode.value === 'closest' && matchMode.value === 'best') {
      const bestCategory = highestScoreCategory.value
      const userPoint = userPoints.find(p => p.label === bestCategory)
      return userPoint
    }
    // When in "By relevance" mode, use the original comparison mode logic
    else if (displayMode.value === 'closest' && matchMode.value === 'relevance') {
      if (props.comparisonMode === 'centroid') {
        return centroid
      }
      // For RIASEC categories, use the user's actual score point for that category
      const userPoint = userPoints.find(p => p.label === props.comparisonMode)
      return userPoint
    }
    // Default fallback
    else {
      if (props.comparisonMode === 'centroid') {
        return centroid
      }
      const userPoint = userPoints.find(p => p.label === props.comparisonMode)
      return userPoint
    }
  }

  const comparisonPoint = getComparisonPoint()
  
  // Get the appropriate color for the comparison
  const getComparisonColor = () => {
    if (displayMode.value === 'closest' && matchMode.value === 'best') {
      return comparisonColors[highestScoreCategory.value]
    }
    return comparisonColors[props.comparisonMode]
  }
  
  const comparisonColor = getComparisonColor()
  
  // Calculate distances from the comparison point
  const csAreasWithDist = csAreas.map(area => {
    const originalX = area.originalX || area.x
    const originalY = area.originalY || area.y
    const dist = Math.sqrt((originalX - comparisonPoint.x) ** 2 + (originalY - comparisonPoint.y) ** 2)
    return {
      ...area,
      dist: dist
    }
  })
  
  csAreasWithDist.sort((a, b) => a.dist - b.dist)
  
  // Get all areas that are among the 5 closest distances (including ties)
  const closest = []
  const uniqueDistances = []
  
  // Get the unique distances for the first 5 positions
  for (const area of csAreasWithDist) {
    if (uniqueDistances.length < 5 && !uniqueDistances.includes(area.dist)) {
      uniqueDistances.push(area.dist)
    }
  }
  
  // Include all areas that have distances within the top 5 unique distances
  const maxDistanceToInclude = uniqueDistances[Math.min(4, uniqueDistances.length - 1)]
  for (const area of csAreasWithDist) {
    if (area.dist <= maxDistanceToInclude) {
      closest.push(area)
    }
  }
  
  const closestNames = new Set(closest.map(a => a.name))
  
  // Emit the closest areas to parent component
  if (displayMode.value === 'all') {
    // When showing all, emit all areas sorted by distance
    emit('closest-areas-updated', csAreasWithDist.map(area => ({
      name: area.name,
      code: getAreaCodeFromName(area.name)
    })))
  } else {
    // When showing closest, emit only the 5 closest
    emit('closest-areas-updated', closest.map(area => ({
      name: area.name,
      code: getAreaCodeFromName(area.name)
    })))
  }
  
  const linesData = closest.map(area => [comparisonPoint, { x: area.x, y: area.y }])

  if (chart) chart.destroy()

  chart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        ...((displayMode.value === 'closest' && matchMode.value === 'relevance' && showLines.value) ? linesData.map(line => ({
          label: 'Line to Closest',
          data: line,
          showLine: true,
          fill: false,
          borderColor: comparisonColor,
          borderWidth: 2,
          pointRadius: 0,
          order: 0,
          legend: false
        })) : []),
        {
          label: 'Your Score',
          data: polygonPoints,
          backgroundColor: 'rgba(255, 64, 129, 0.15)',
          borderColor: 'rgba(255, 64, 129, 0.7)',
          borderWidth: 2,
          pointRadius: 0,
          showLine: true,
          fill: true,
          tension: 0,
          order: 0
        },
        {
          label: 'CS Areas',
          data: displayMode.value === 'closest'
            ? csAreas.filter(a => !closestNames.has(a.name))
            : csAreas,
          backgroundColor: 'rgba(33, 150, 243, 0.8)',
          borderColor: '#1976d2',
          borderWidth: 2,
          pointRadius: 7,
          pointHoverRadius: 11,
          pointStyle: 'rectRounded',
          showLine: false,
          order: 3
        },
        ...(displayMode.value === 'closest' ? [{
          label: 'CS Areas Highlighted',
          data: csAreas.filter(a => closestNames.has(a.name)),
          backgroundColor: comparisonColor,
          borderColor: comparisonColor,
          borderWidth: 4,
          pointRadius: 12,
          pointHoverRadius: 16,
          pointStyle: 'rectRounded',
          showLine: false,
          order: 1
        }] : [])
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 0
      },
      scales: {
        x: {
          min: 0.5,
          max: 11.5,
          grid: {
            color: 'rgba(186, 104, 200, 0.15)',
            lineWidth: 1
          },
          ticks: {
            display: false
          },
          axis: 'x',
          offset: false,
          position: 'center',
        },
        y: {
          min: 0.5,
          max: 11.5,
          reverse: true,
          grid: {
            color: 'rgba(186, 104, 200, 0.15)',
            lineWidth: 1
          },
          ticks: {
            display: false
          },
          axis: 'y',
          offset: false,
          position: 'center',
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#ab47bc',
            font: { size: 14 },
            // Hide 'Line to Closest' and highlighted dataset from legend
            filter: (item) => item.text !== 'Line to Closest' && item.text !== 'CS Areas Highlighted'
          }
        },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: true,
          usePointStyle: true,
          callbacks: {
            title: function(context) {
              // For overlapping points, show a custom title
              if (context.length > 0) {
                const datasetLabel = context[0].dataset.label
                if (datasetLabel === 'CS Areas' || datasetLabel === 'CS Areas Highlighted') {
                  const clickedPoint = context[0].raw
                  const overlappingAreas = csAreas.filter(area => 
                    Math.abs(area.x - clickedPoint.x) < 0.01 && 
                    Math.abs(area.y - clickedPoint.y) < 0.01
                  )
                  
                  if (overlappingAreas.length > 1) {
                    return `${overlappingAreas.length} areas here:`
                  }
                }
              }
              return ''
            },
            label: function(context) {
              const datasetLabel = context.dataset.label
              // Show CS area name for CS area points
              if (datasetLabel === 'CS Areas' || datasetLabel === 'CS Areas Highlighted') {
                const clickedPoint = context.raw
                // Find all areas at the same exact coordinates
                const overlappingAreas = csAreas.filter(area => 
                  Math.abs(area.x - clickedPoint.x) < 0.01 && 
                  Math.abs(area.y - clickedPoint.y) < 0.01
                )
                
                if (overlappingAreas.length > 1) {
                  // Create a unique set of area names and only show once per tooltip
                  const uniqueNames = [...new Set(overlappingAreas.map(area => area.name))]
                  
                  // Only show the full list from the first context to avoid duplication
                  if (context.dataIndex === 0 || 
                      !context.chart._tooltipShownForLocation || 
                      context.chart._tooltipShownForLocation !== `${Math.round(clickedPoint.x * 100)},${Math.round(clickedPoint.y * 100)}`) {
                    
                    context.chart._tooltipShownForLocation = `${Math.round(clickedPoint.x * 100)},${Math.round(clickedPoint.y * 100)}`
                    
                    return uniqueNames
                  } else {
                    return [] // Already shown, don't duplicate
                  }
                } else {
                  // Single area
                  const area = overlappingAreas[0] || csAreas.find(area => 
                    Math.abs(area.x - clickedPoint.x) < 0.01 && 
                    Math.abs(area.y - clickedPoint.y) < 0.01
                  )
                  return area ? area.name : (context.raw.name || 'CS Area')
                }
              }
              // Show RIASEC category name and percentage for user area points
              if (datasetLabel === 'Your Score') {
                const point = context.raw
                if (point.label) {
                  const score = props.scores[point.label] || 0
                  const percentage = Math.round((score / 32) * 100)
                  const categoryNames = {
                    R: 'Realistic',
                    I: 'Investigative', 
                    A: 'Artistic',
                    S: 'Social',
                    E: 'Enterprising',
                    C: 'Conventional'
                  }
                  return `${categoryNames[point.label]}: ${percentage}%`
                }
                return ''
              }
              // No tooltip for lines or centroid
              return ''
            },
            beforeBody: function(context) {
              // Reset the location tracker for each new tooltip
              if (context.length > 0) {
                context[0].chart._tooltipShownForLocation = null
              }
              return ''
            }
          },
          displayColors: false,
          bodyFont: { size: 16 },
          titleFont: { size: 12 },
          backgroundColor: 'rgba(255,255,255,0.95)',
          titleColor: '#888',
          bodyColor: '#333',
          borderColor: '#d81b60',
          borderWidth: 2,
          z: 9999,
          caretSize: 8,
          caretPadding: 8,
          padding: 12
        }
      },
      hover: {
        mode: 'nearest',
        intersect: true,
        animationDuration: 0
      },
      animation: false,
      elements: {
        point: {
          hitRadius: 20
        }
      }
    },
    plugins: [{
      id: 'centerAxes',
      beforeDraw: (chart) => {
        const { ctx, chartArea, scales } = chart
        if (!chartArea) return
        // Draw vertical axis (people-things)
        ctx.save()
        ctx.strokeStyle = '#535353'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(scales.x.getPixelForValue(6), chartArea.top)
        ctx.lineTo(scales.x.getPixelForValue(6), chartArea.bottom)
        ctx.stroke()
        // Draw horizontal axis (data-ideas)
        ctx.beginPath()
        ctx.moveTo(chartArea.left, scales.y.getPixelForValue(6))
        ctx.lineTo(chartArea.right, scales.y.getPixelForValue(6))
        ctx.stroke()
        ctx.restore()
        // Draw axis labels with custom offsets
        ctx.save()
        ctx.font = 'bold 14px sans-serif'
        ctx.fillStyle = '#535353'
        // Left (People) - with right arrow
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        ctx.fillText('People', chartArea.left + 32, scales.y.getPixelForValue(6) - 18)
        // Right (Things) - with left arrow
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText('→ Things', chartArea.right - 50, scales.y.getPixelForValue(6) - 18)
        // Top (Data) - with down arrow
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText('Data', scales.x.getPixelForValue(6) + 18, chartArea.top + 8)
        // Bottom (Ideas) - with up arrow
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText('↓ Ideas', scales.x.getPixelForValue(6) + 18, chartArea.bottom - 8)
        ctx.restore()
      }
    }]
  })
}

onMounted(() => {
  createChart()
})

watch([() => props.scores, displayMode, showLines, matchMode, selectedComparison], () => {
  createChart()
}, { deep: true })

// Watch for changes in comparison mode
watch(() => props.comparisonMode, () => {
  createChart()
})

// Toggle functions for better control
const toggleDisplayMode = () => {
  displayMode.value = displayMode.value === 'closest' ? 'all' : 'closest'
}

const toggleMatchMode = () => {
  matchMode.value = matchMode.value === 'best' ? 'relevance' : 'best'
}

// Helper function to extract area code from CS area name
function getAreaCodeFromName(areaName) {
  // Direct mapping for exact matches from the CSV
  const exactMatches = {
    'Artificial Intelligence (AI)': 'AI',
    'Algorithmic Foundations (AL)': 'AL',
    'Architecture and Organization (AR)': 'AR',
    'Data Management (DM)': 'DM',
    'Foundations of Programming Languages (FPL)': 'FPL',
    'Graphics and Interactive Techniques (GIT)': 'GIT',
    'Human-Computer Interaction (HCI)': 'HCI',
    'Mathematical and Statistical Foundations (MSF)': 'MSF',
    'Networking and Communication (NC)': 'NC',
    'Operating Systems (OS)': 'OS',
    'Parallel and Distributed Computing (PDC)': 'PDC',
    'Software Development Fundamentals (SDF)': 'SDF',
    'Software Engineering (SE)': 'SE',
    'Security (SEC)': 'SEC',
    'Society Ethics and Profession (SEP)': 'SEP',
    'Systems Fundamentals (SF)': 'SF',
    'Specialized Platform Development (SPD)': 'SPD'
  }
  
  // Try exact match first
  if (exactMatches[areaName]) {
    return exactMatches[areaName]
  }
  
  // Fallback to partial matching
  const nameToCodeMap = {
    'Artificial Intelligence': 'AI',
    'Machine Learning': 'AI',
    'Data Science': 'AI',
    'Algorithm': 'AL',
    'Algorithms': 'AL',
    'Data Structures': 'AL',
    'Computer Architecture': 'AR',
    'Computer Organization': 'AR',
    'Architecture and Organization': 'AR',
    'Database': 'DM',
    'Data Management': 'DM',
    'Programming Language': 'FPL',
    'Programming Languages': 'FPL',
    'Compiler': 'FPL',
    'Graphics': 'GIT',
    'Computer Graphics': 'GIT',
    'Game Development': 'GIT',
    'Human Computer Interaction': 'HCI',
    'User Interface': 'HCI',
    'UX': 'HCI',
    'Mathematical and Statistical': 'MSF',
    'Mathematics': 'MSF',
    'Statistics': 'MSF',
    'Network': 'NC',
    'Networking': 'NC',
    'Communication': 'NC',
    'Operating System': 'OS',
    'System Programming': 'OS',
    'Parallel Computing': 'PDC',
    'Distributed Computing': 'PDC',
    'Software Development': 'SDF',
    'Programming': 'SDF',
    'Software Engineering': 'SE',
    'Project Management': 'SE',
    'Security': 'SEC',
    'Cybersecurity': 'SEC',
    'Information Security': 'SEC',
    'Ethics': 'SEP',
    'Professional Practice': 'SEP',
    'Society Ethics': 'SEP',
    'System': 'SF',
    'Systems': 'SF',
    'Systems Fundamentals': 'SF',
    'Mobile Development': 'SPD',
    'Web Development': 'SPD',
    'Embedded Systems': 'SPD',
    'Specialized Platform': 'SPD'
  }
  
  // Try to find a match in the name
  for (const [keyword, code] of Object.entries(nameToCodeMap)) {
    if (areaName.toLowerCase().includes(keyword.toLowerCase())) {
      return code
    }
  }
  
  // Ultimate fallback
  return 'CS'
}
</script>

<style scoped>
.riasec-plot-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.plot-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
}
canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  background: none;
  box-shadow: none;
  border-radius: 0;
}
.toggle-btns, .match-mode-btns {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
  flex-direction: row;
  gap: 0.5rem;
}
.custom-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}
.toggle-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}
.toggle-btn:hover {
  color: #374151;
  background: rgba(255, 255, 255, 0.5);
}
.toggle-btn.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.comparison-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(171, 71, 188, 0.2);
  width: 100%;
}
.comparison-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ab47bc;
  margin-bottom: 0.75rem;
  text-align: left;
}
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
.comparison-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.comparison-radio {
  width: 1rem;
  height: 1rem;
  accent-color: #ab47bc;
}
.comparison-label {
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}
.lines-checkbox {
  margin-bottom: 0.5rem;
  color: #ab47bc;
  font-weight: bold;
}
@media (max-width: 600px) {
  .riasec-plot-container {
    max-width: 98vw;
  }
  .comparison-grid {
    grid-template-columns: 1fr;
    gap: 0.375rem;
  }
}
@media (min-width: 600px) {
  .comparison-grid {
    grid-template-columns: repeat(3, 1fr);
    justify-items: start;
  }
}
</style> 