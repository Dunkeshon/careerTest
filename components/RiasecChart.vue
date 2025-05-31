<template>
  <div class="riasec-plot-container">
    <div class="toggle-btns">
      <SelectButton v-model="displayMode" :options="displayOptions" optionLabel="label" optionValue="value" aria-labelledby="displaymode" />
    </div>
    <div v-if="displayMode === 'closest'" class="lines-checkbox">
      <label><input type="checkbox" v-model="showLines" /> Show lines to closest</label>
    </div>
    <div class="plot-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import SelectButton from 'primevue/selectbutton'
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

const displayOptions = [
  { label: 'Show closest', value: 'closest' },
  { label: 'Show all', value: 'all' }
]
const displayMode = ref('closest')
const showLines = ref(true)
const chartCanvas = ref(null)
let chart = null

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

// Parse CS Areas CSV
function parseCSAreas(csv) {
  const lines = csv.trim().split('\n')
  const result = []
  for (let i = 1; i < lines.length; i++) {
    const [name, x, y] = lines[i].split(',')
    result.push({ name: name.trim(), x: Number(x), y: Number(y) })
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
    if (props.comparisonMode === 'centroid') {
      return centroid
    }
    // For RIASEC categories, use the user's actual score point for that category
    const userPoint = userPoints.find(p => p.label === props.comparisonMode)
    return userPoint
  }

  const comparisonPoint = getComparisonPoint()
  
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
  const closest = csAreasWithDist.slice(0, 5)
  const closestNames = new Set(closest.map(a => a.name))
  
  // Debug: log closest areas and their distances
  console.log('Comparison point:', comparisonPoint)
  console.log('Comparison mode:', props.comparisonMode)
  console.log('All areas with distances:', csAreasWithDist.map(area => ({ 
    name: area.name, 
    dist: area.dist.toFixed(3), 
    x: area.originalX || area.x, 
    y: area.originalY || area.y,
    isExactMatch: area.dist === 0
  })))
  console.log('Closest areas:', closest.map(area => ({ name: area.name, dist: area.dist.toFixed(3), x: area.originalX || area.x, y: area.originalY || area.y })))
  
  const linesData = closest.map(area => [comparisonPoint, { x: area.x, y: area.y }])

  if (chart) chart.destroy()

  chart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        ...((displayMode.value === 'closest' && showLines.value) ? linesData.map(line => ({
          label: 'Line to Closest',
          data: line,
          showLine: true,
          fill: false,
          borderColor: comparisonColors[props.comparisonMode],
          borderWidth: 2,
          pointRadius: 0,
          order: 0,
          legend: false
        })) : []),
        {
          label: 'Your Area',
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
            ? csAreas.map(a => ({ ...a, highlight: closestNames.has(a.name) }))
            : csAreas.map(a => ({ ...a, highlight: false })),
          backgroundColor: ctx => ctx.raw.highlight ? comparisonColors[props.comparisonMode] : 'rgba(33, 150, 243, 0.8)',
          borderColor: ctx => ctx.raw.highlight ? comparisonColors[props.comparisonMode] : '#1976d2',
          borderWidth: ctx => ctx.raw.highlight ? 4 : 2,
          pointRadius: ctx => ctx.raw.highlight ? 12 : 7,
          pointHoverRadius: ctx => ctx.raw.highlight ? 16 : 11,
          pointStyle: 'rectRounded',
          showLine: false,
          order: 3
        },
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
            // Hide 'Line to Closest' from legend
            filter: (item) => item.text !== 'Line to Closest'
          }
        },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: true,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              const datasetLabel = context.dataset.label
              // Only show CS area name for CS area points
              if (datasetLabel === 'CS Areas') {
                return context.raw.name
              }
              // Only show coordinates for user area points
              if (datasetLabel === 'Your Area') {
                const point = context.raw
                return `${point.label ? point.label + ': ' : ''}(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`
              }
              // No tooltip for lines or centroid
              return ''
            }
          },
          displayColors: false,
          bodyFont: { size: 16 },
          backgroundColor: 'rgba(255,255,255,0.95)',
          titleColor: '#d81b60',
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
        ctx.strokeStyle = '#ab47bc'
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
        ctx.fillStyle = '#ab47bc'
        // Left (People) - higher
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        ctx.fillText('People', chartArea.left + 32, scales.y.getPixelForValue(6) - 18)
        // Right (Things) - higher
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText('Things', chartArea.right - 32, scales.y.getPixelForValue(6) - 18)
        // Top (Data) - offset right, higher
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText('Data', scales.x.getPixelForValue(6) + 18, chartArea.top + 8)
        // Bottom (Ideas) - offset right, lower
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText('Ideas', scales.x.getPixelForValue(6) + 18, chartArea.bottom - 8)
        ctx.restore()
      }
    }]
  })
}

onMounted(() => {
  createChart()
})

watch([() => props.scores, displayMode, showLines], () => {
  createChart()
}, { deep: true })

// Watch for changes in comparison mode
watch(() => props.comparisonMode, () => {
  createChart()
})
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
.toggle-btns {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
  flex-direction: row;
  gap: 0.5rem;
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
}
</style> 