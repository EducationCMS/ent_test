<script setup lang="ts">
import Dialog from "primevue/dialog"
import Image from "primevue/image"
import SelectButton from "primevue/selectbutton"
import MendeleevsTable from "@/assets/images/MendeleevsTable.png"
import SolubilityTable from "@/assets/images/SolubilityTable.jpg"
import { ref } from "vue"

const dialogIsVisible = defineModel<boolean>()
const currentTable = ref('M')
const options = ref([{ value: 'M', text: 'Менделеев кестесі' }, { value: 'S', text: 'Ерігіштік кестесі' }]);
</script>

<template>
  <Dialog v-model:visible="dialogIsVisible" header="Құралдар" :style="{ width: '800px' }">
    <div>
      <div class="flex justify-content-center mb-4">
        <SelectButton v-model="currentTable" :options="options" option-label="text" option-value="value" aria-labelledby="basic" />
      </div>
      <Image :src="currentTable === 'M' ? MendeleevsTable: SolubilityTable" preview image-class="w-full" />
    </div>
  </Dialog>
</template>

<style lang="scss">
.p-image-preview {
  max-height: 80vh;
}
.p-image-toolbar {
  z-index: 400;
}

.p-image-action.p-link {
  background-color: var(--primary-500);

  &:hover {
    background-color: var(--primary-600);
  }
}
</style>
