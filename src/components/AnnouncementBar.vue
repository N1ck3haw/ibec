<template>
  <div class="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
    <div class="max-w-7xl mx-auto flex items-start sm:items-center">
      <span class="text-yellow-600 mr-2 flex-shrink-0">⚠️</span>
      <p class="text-sm text-yellow-800 font-medium">
        <template v-if="isEnglish">
          <strong>Important:</strong> Only the Team Leader needs to register and submit. All team information should be filled out and submitted by the Leader. Team members do not need to perform separate actions.
        </template>
        <template v-else>
          <strong>重要提醒：</strong>每支队伍仅需队长完成注册和提交操作，所有队伍信息由队长统一填写和提交，队员无需单独操作。
        </template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLanguage } from '../composables/useLanguage'
const { isEnglish } = useLanguage()
</script>