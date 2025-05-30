<template>
  <div class="riasec-radar-container">
    <canvas ref="radarCanvas"></canvas>
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

const radarCanvas = ref(null)
let radarChart = null

const riasecLabels = ['R', 'I', 'A', 'S', 'E', 'C']
const riasecFullNames = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional'
}
const maxScore = 32

const getUserData = () => riasecLabels.map(label => props.scores[label] || 0)

const createRadarChart = () => {
  const ctx = radarCanvas.value.getContext('2d')
  if (radarChart) radarChart.destroy()
  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: riasecLabels,
      datasets: [
        {
          label: 'Your Results',
          data: getUserData(),
          backgroundColor: 'rgba(255, 64, 129, 0.25)',
          borderColor: 'rgba(255, 64, 129, 0.7)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(255, 64, 129, 0.7)',
          pointRadius: 10,
          pointHoverRadius: 14,
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: maxScore,
          angleLines: { color: 'rgba(186, 104, 200, 0.2)' },
          grid: { color: 'rgba(186, 104, 200, 0.15)' },
          pointLabels: {
            color: '#ab47bc',
            font: { size: 16, weight: 'bold' }
          },
          ticks: {
            color: '#ab47bc',
            font: { size: 12 },
            stepSize: 8
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: true,
          usePointStyle: true,
          displayColors: false,
          callbacks: {
            title: function(context) {
              const idx = context[0].dataIndex
              const label = riasecLabels[idx]
              return riasecFullNames[label]
            },
            label: function(context) {
              return `Score: ${context.formattedValue}`
            }
          },
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
      elements: {
        point: {
          hitRadius: 20
        }
      }
    }
  })
}

onMounted(() => {
  createRadarChart()
})

watch(() => props.scores, () => {
  createRadarChart()
}, { deep: true })
</script>

<style scoped>
.riasec-radar-container {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  padding: 0;
  background: none;
  box-shadow: none;
  border-radius: 0;
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
  .riasec-radar-container {
    max-width: 98vw;
  }
}
</style> 