<template>
  <div class="likert-question">
    <div class="question-text text-center mb-4 text-lg font-medium no-mx">
      {{ question }}
    </div>
    <div class="flex flex-col items-center w-full">
      <div class="flex flex-row justify-between items-center w-full max-w-xs mx-auto gap-2">
        <button
          v-for="n in 5"
          :key="n"
          :class="[
            'flex items-center justify-center border-2 transition focus:outline-none',
            circleSizeClass(n),
            circleOutlineClass(n, value === n),
            value === n ? circleFillClass(n) : 'bg-white'
          ]"
          @click="$emit('update:value', n)"
        >
          <svg v-if="value === n" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
      <div class="flex flex-row justify-between w-full max-w-xs mx-auto mt-2">
        <span class="text-xs text-purple-500 font-semibold">DISLIKE</span>
        <span class="text-xs text-green-500 font-semibold ml-auto">ENJOY</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  question: String,
  value: Number
})
defineEmits(['update:value'])

function circleSizeClass(n) {
  if (n === 3) return 'w-7 h-7 rounded-full'; // smallest
  if (n === 2 || n === 4) return 'w-10 h-10 rounded-full'; // medium
  return 'w-12 h-12 rounded-full'; // largest (1 & 5)
}

function circleOutlineClass(n, selected) {
  if (n === 1 || n === 2) return selected ? 'border-purple-600' : 'border-purple-300';
  if (n === 4 || n === 5) return selected ? 'border-green-600' : 'border-green-300';
  return selected ? 'border-gray-500' : 'border-gray-300';
}

function circleFillClass(n) {
  if (n === 1 || n === 2) return 'bg-purple-500';
  if (n === 4 || n === 5) return 'bg-green-500';
  return 'bg-gray-500';
}
</script>

<style scoped>
.likert-question {
  width: 100%;
  max-width: 400px;
  margin: 0 auto 2rem auto;
}
button:focus {
  outline: 2px solid #a78bfa;
}
.no-mx {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style> 