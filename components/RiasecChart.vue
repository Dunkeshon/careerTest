<template>
  <div class="riasec-plot-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  scores: {
    type: Object,
    default: () => ({})
  }
})

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

const createChart = () => {
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

  if (chart) chart.destroy()

  chart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'RIASEC Reference Points',
          data: riasecPoints,
          backgroundColor: 'rgba(186, 104, 200, 0.7)', // purple
          pointRadius: 8,
          pointHoverRadius: 12,
          pointStyle: 'circle',
          borderColor: '#ab47bc',
          borderWidth: 2,
          showLine: false,
          order: 1
        },
        {
          label: 'Your Results',
          data: userPoints,
          backgroundColor: 'rgba(255, 64, 129, 0.8)', // pink
          pointRadius: 10,
          pointHoverRadius: 14,
          pointStyle: 'circle',
          borderColor: '#d81b60',
          borderWidth: 2,
          showLine: false,
          order: 2
        },
        {
          label: 'Your Area',
          data: polygonPoints,
          backgroundColor: 'rgba(255, 64, 129, 0.15)', // pink fill
          borderColor: 'rgba(255, 64, 129, 0.7)',
          borderWidth: 2,
          pointRadius: 0,
          showLine: true,
          fill: true,
          tension: 0,
          order: 0
        }
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
          min: 1,
          max: 11,
          grid: {
            color: 'rgba(186, 104, 200, 0.15)',
            lineWidth: 1
          },
          ticks: {
            display: false
          },
          axis: 'x',
          offset: false,
          // Draw axis at center
          position: 'center',
        },
        y: {
          min: 1,
          max: 11,
          grid: {
            color: 'rgba(186, 104, 200, 0.15)',
            lineWidth: 1
          },
          ticks: {
            display: false
          },
          axis: 'y',
          offset: false,
          // Draw axis at center
          position: 'center',
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#ab47bc',
            font: { size: 14 }
          }
        },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: true,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              const point = context.raw
              return `${point.label}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`
            }
          },
          displayColors: false,
          bodyFont: { size: 16 },
          backgroundColor: 'rgba(255,255,255,0.95)',
          titleColor: '#d81b60',
          bodyColor: '#333',
          borderColor: '#d81b60',
          borderWidth: 1,
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
      afterDraw: (chart) => {
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

watch(() => props.scores, () => {
  createChart()
}, { deep: true })
</script>

<style scoped>
.riasec-plot-container {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  padding: 0;
  background: none;
  box-shadow: none;
  border-radius: 0;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}
canvas {
  width: 100% !important;
  height: 100% !important;
  background: none;
  box-shadow: none;
  border-radius: 0;
  display: block;
}
@media (max-width: 600px) {
  .riasec-plot-container {
    max-width: 98vw;
  }
}
</style> 