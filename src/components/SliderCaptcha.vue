<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{ (e: 'verified', val: boolean): void }>()

const trackWidth = 300
const btnWidth = 44
const maxSlide = trackWidth - btnWidth

const dragging = ref(false)
const verified = ref(false)
const startX = ref(0)
const currentX = ref(0)

const offset = computed(() => Math.min(Math.max(currentX.value, 0), maxSlide))
const progress = computed(() => (offset.value / maxSlide) * 100)

const onMouseDown = (e: MouseEvent) => {
  if (verified.value) return
  dragging.value = true
  startX.value = e.clientX - currentX.value
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const onTouchStart = (e: TouchEvent) => {
  if (verified.value) return
  dragging.value = true
  startX.value = e.touches[0].clientX - currentX.value
  window.addEventListener('touchmove', onTouchMove)
  window.addEventListener('touchend', onTouchEnd)
}

const onMouseMove = (e: MouseEvent) => {
  if (!dragging.value) return
  currentX.value = e.clientX - startX.value
}

const onTouchMove = (e: TouchEvent) => {
  if (!dragging.value) return
  currentX.value = e.touches[0].clientX - startX.value
}

const finish = () => {
  dragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)

  if (offset.value >= maxSlide - 4) {
    currentX.value = maxSlide
    verified.value = true
    emit('verified', true)
  } else {
    currentX.value = 0
    emit('verified', false)
  }
}

const onMouseUp = finish
const onTouchEnd = finish

const reset = () => {
  verified.value = false
  currentX.value = 0
  dragging.value = false
  emit('verified', false)
}

defineExpose({ reset })
</script>

<template>
  <div class="select-none" style="width: 300px;">
    <!-- Track -->
    <div
      class="relative rounded-full overflow-hidden border border-gray-300"
      style="height: 44px; background: #f3f4f6;"
    >
      <!-- Fill -->
      <div
        class="absolute top-0 left-0 h-full rounded-full transition-colors duration-200"
        :style="{ width: offset + btnWidth / 2 + 'px', background: verified ? '#22c55e' : '#bfdbfe' }"
      />

      <!-- Label -->
      <div class="absolute inset-0 flex items-center justify-center text-sm pointer-events-none"
           :class="verified ? 'text-white font-medium' : 'text-gray-400'">
        <span v-if="!verified">{{ $attrs.lang === 'zh' ? '向右滑动验证' : 'Slide to verify' }}</span>
        <span v-else>✓</span>
      </div>

      <!-- Button -->
      <div
        class="absolute top-0 flex items-center justify-center rounded-full border border-gray-300 cursor-grab active:cursor-grabbing shadow"
        :style="{
          width: btnWidth + 'px',
          height: '44px',
          left: offset + 'px',
          background: verified ? '#22c55e' : 'white',
          transition: dragging ? 'none' : 'left 0.2s',
          zIndex: 10
        }"
        @mousedown="onMouseDown"
        @touchstart.prevent="onTouchStart"
      >
        <svg v-if="!verified" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  </div>
</template>
