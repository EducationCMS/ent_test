<script setup lang="ts">
import {onMounted, reactive, ref} from "vue"
import http from "@/plugins/axios"
import Input from "@/components/Form/Input"
import Button from "primevue/button"
import type {DataTableRowEditSaveEvent} from "primevue/datatable"

const editingRows = ref([])
const classes = ref([])
const classForm = reactive({
  name: '',
  testTimeLimit: new Date(new Date().setHours(0, 0, 0, 0))
})
const errors = ref({})
const isLoading = ref(false)

const getClasses = async () => {
  isLoading.value = true
  try {
    const {data} = await http.get('api/dictionary/school-class')
    classes.value = data || []
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    isLoading.value = false
  }
}

const createClass = async () => {
  try {
    const {data} = await http.post('api/admin/school-class', {
      name: classForm.name,
      testTimeLimit: classForm.testTimeLimit.toLocaleTimeString()
    })
    await getClasses()
    classForm.name = ''
    classForm.testTimeLimit = new Date(new Date().setHours(0, 0, 0, 0))
  } catch (e) {
    console.error(e)
    throw e
  }
}

const updateClass = async (id: number, name: string, testTimeLimit: string) => {
  try {
    await http.put('api/admin/school-class', {id, name, testTimeLimit})
    await getClasses()
  } catch (e) {
    console.error(e)
    throw e
  }
}

const onRowEditSave = (event: DataTableRowEditSaveEvent) => {
  let {newData} = event;
  const time = typeof newData.testTimeLimit === 'string' ? newData.testTimeLimit : newData.testTimeLimit.toLocaleTimeString()
  if (newData.id && newData.name && newData.testTimeLimit)
    updateClass(newData.id, newData.name, time)
};

onMounted(getClasses)
</script>

<template>
  <div class="flex justify-content-between align-items-center mb-6">
    <h1 class="mb-0">Классы</h1>
  </div>
  <div style="max-width: 600px">
    <DataTable v-model:editingRows="editingRows" :loading="isLoading" :value="classes" editMode="row" dataKey="id"
               @row-edit-save="onRowEditSave"
               :pt="{
      column: {
          bodycell: ({ state }) => ({
              style:  state['d_editing']&&'padding-top: 0.6rem; padding-bottom: 0.6rem'
          })
      }
    }"
    >
      <template #empty>
        <span class="text-center">Нет данных</span>
      </template>
      <Column field="name" header="Название" style="width: 20%">
        <template #editor="{ data, field }">
          <Input
              v-model="data[field]"
              placeholder="Название"
          />
        </template>
      </Column>
      <Column field="testTimeLimit" header="Ограничение времени теста" style="width: 20%">
        <template #editor="{ data, field }">
          <Calendar v-model="data[field]" manual-input placeholder="Ограничение времени теста" timeOnly/>
        </template>
      </Column>
      <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
    </DataTable>
  </div>
  <div class="flex gap-3 mt-6">
    <Input
        v-model="classForm.name"
        placeholder="Название"
        :error="errors['name']"
    />
    <Calendar id="calendar-timeonly" v-model="classForm.testTimeLimit" manual-input placeholder="Ограничение времени теста"
              timeOnly/>
    <Button
        rounded
        icon="pi pi-plus"
        icon-class="font-semibold"
        @click="createClass"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
