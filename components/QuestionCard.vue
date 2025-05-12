<template>
  <div
    class="question-card transition-all duration-300 overflow-hidden bg-white rounded-2xl shadow-lg mb-8 mx-auto"
    :class="active ? 'active-card' : 'inactive-card'"
    @click="activate"
    ref="cardRef"
  >
    <NuxtImg
      src="/testImage.png"
      alt="Question Image"
      class="question-image w-full object-cover rounded-xl mb-4"
      :class="active ? 'image-active' : 'image-disabled'"
      width="430"
      height="192"
      format="webp"
      quality="70"
      loading="lazy"
      decoding="async"
    />
    <div class="question-text text-center mb-4 text-lg font-medium no-mx">
      {{ question }}
    </div>
    <div class="flex flex-col items-center w-full">
      <div class="flex flex-row justify-between items-center w-full max-w-xs mx-auto gap-2"
           :class="!active ? 'opacity-50 pointer-events-none' : ''">
        <button
          v-for="n in 5"
          :key="n"
          :class="[
            'flex items-center justify-center border-2 transition focus:outline-none',
            circleSizeClass(n),
            circleOutlineClass(n, value === n),
            value === n ? circleFillClass(n) : 'bg-white',
            !active ? 'pointer-events-none opacity-50' : ''
          ]"
          @click.stop="select(n)"
        >
          <svg v-if="value === n" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
      <div class="flex flex-row justify-between w-full max-w-xs mx-auto mt-2"
           :class="!active ? 'opacity-50' : ''">
        <span class="text-xs text-purple-500 font-semibold">DISLIKE</span>
        <span class="text-xs text-green-500 font-semibold ml-auto">ENJOY</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { NuxtImg } from '#components'
const props = defineProps({
  question: String,
  value: Number,
  active: Boolean,
  index: Number
})
const emit = defineEmits(['update:value', 'activate'])
const cardRef = ref(null)

function select(n) {
  if (props.active) emit('update:value', n)
}
function activate() {
  if (!props.active) emit('activate', props.index)
}

watch(() => props.active, (newVal) => {
  if (newVal) {
    nextTick(() => {
      cardRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
})

function circleSizeClass(n) {
  if (n === 3) return 'w-7 h-7 rounded-full';
  if (n === 2 || n === 4) return 'w-10 h-10 rounded-full';
  return 'w-12 h-12 rounded-full';
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
.question-card {
  max-width: 430px;
  cursor: pointer;
  transition:
    box-shadow 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}
.active-card {
  max-width: 430px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.10);
}
.inactive-card {
  max-width: 430px;
  padding: 24px;
  opacity: 0.7;
}
.question-image {
  height: 192px;
  width: 100%;
  object-fit: cover;
  transition: filter 0.2s, opacity 0.2s;
}
.image-active {
  filter: none;
  opacity: 1;
}
.image-disabled {
  filter: grayscale(1) blur(2px) brightness(0.85);
  opacity: 0.5;
}
img {
  display: block;
  width: 100%;
  object-fit: cover;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}
.no-mx {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style> 