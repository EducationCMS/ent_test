<script setup lang="ts">
import { defineModel } from "vue"

const modelValue = defineModel()
defineProps({
  error: { type: String, default: '' },
  label: { type: String },
  id: { type: String },
  placeholder: { type: String }
})
</script>

<template>
  <div>
    <label v-if="!!label" :for="id" class="font-semibold block mb-2">{{ label }}</label>
    <InputText
      :id="id"
      v-model="modelValue"
      :class="[!!error && 'p-invalid']"
      :aria-describedby="`${id}_error`"
      :placeholder="placeholder ?? ''"
      class="w-full"
    />
    <small v-if="error" class="p-error" :id="`${id}_error`">{{ error ?? '&nbsp;'  }}</small>
  </div>
</template>
