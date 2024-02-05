<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import http from "@/plugins/axios"
import type { DropdownChangeEvent } from "primevue/dropdown"
import Chip from "primevue/chip"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import Listbox from "primevue/listbox"
import InputText from "primevue/inputtext"
import InputNumber from "primevue/inputnumber"

const firstSubject = ref(null)
const selectedSubjectsOfFirstSubject = ref([])
const notSelectedSubjectsOfFirstSubject = ref([])
const selectedSubjectsOfSecondSubject = ref([])
const notSelectedSubjectsOfSecondSubject = ref([])
const listBoxSelectedSubjects = ref([])
const dialogIsVisible = ref(false)
const isFetching = ref(false)
const testTypes = ref([
  { label: 'Стандарт', value: 'SURVIVAL' },
  { label: 'Творческий', value: 'CREATIVE' },
])
const selectedType = ref('')
const defaultSubjectData = reactive({
  subject: null,
  questionsCount: 0
})

const allSubjects = ref([])

const getSubjectsDictionary = async() => {
  isFetching.value = true
  try {
    const { data } = await http.get("api/dictionary/subjects")
    allSubjects.value = data ?? []
  } catch(e) {
    console.error(e)
    throw e
  } finally {
    isFetching.value = false
  }
}

const getSelectedSubjects = async(id: number) => {
  try {
    const { data } = await http.get(`api/ent-test/subjects-in-mss`, {
      params: { subjectId: id }
    })
    selectedSubjectsOfFirstSubject.value = data ?? []
  } catch(e) {
    console.error(e)
    throw e
  }
}

const getNotSelectedSubjects = async(id: number) => {
  try {
    const { data } = await http.get(`api/ent-test/subjects-not-in-mss`, {
      params: { subjectId: id }
    })
    notSelectedSubjectsOfFirstSubject.value = data ?? []
  } catch(e) {
    console.error(e)
    throw e
  }
}

const getSelectedDefaultSubjects = async(type: string) => {
  try {
    const { data } = await http.get(`api/ent-test/subjects-in-mts`, {
      params: { type }
    })
    selectedSubjectsOfSecondSubject.value = data ?? []
  } catch(e) {
    console.error(e)
    throw e
  }
}

const getNotSelectedDefaultSubjects = async(type: number) => {
  try {
    const { data } = await http.get(`api/ent-test/subjects-not-in-mts`, {
      params: { type }
    })
    notSelectedSubjectsOfSecondSubject.value = data ?? []
  } catch(e) {
    console.error(e)
    throw e
  }
}

const onFirstSubjectChange = async(event: DropdownChangeEvent) => {
  const subjectId = event.value
  await getSelectedSubjects(subjectId)
}

const onSecondSubjectChange = (event: DropdownChangeEvent) => {
  getSelectedDefaultSubjects(event.value)
  getNotSelectedDefaultSubjects(event.value)
}
const openDialog = () => {
  getNotSelectedSubjects(firstSubject.value)
  dialogIsVisible.value = true
}

const addToFirstSubject = async() => {
  try {
    const { data } = await http.post('api/admin/matrix-subject-to-subject', {
      subjectId: firstSubject.value,
      subjects: listBoxSelectedSubjects.value.map(subject => subject.id)
    })
    selectedSubjectsOfFirstSubject.value = [...selectedSubjectsOfFirstSubject.value, ...listBoxSelectedSubjects.value]
  } catch(e) {
    console.error(e)
    throw e
  }
  dialogIsVisible.value = false
}

const addDefaultSubject = async() => {
  try {
    await http.post(`api/admin/matrix-test-type-to-subject`, {
      type: selectedType.value,
      subject: { id: defaultSubjectData.subject },
      questionCount: defaultSubjectData.questionsCount
    })
    defaultSubjectData.subject = null
    defaultSubjectData.questionsCount = 0
    await getSelectedDefaultSubjects(selectedType.value)
  } catch(e) {
    console.error(e)
    throw e
  }
}

const deleteDefaultSubject = async(id: number) => {
  try {
    await http.delete(`api/admin/matrix-test-type-to-subject/${id}/${selectedType.value}`)
    await getSelectedDefaultSubjects(selectedType.value)
  } catch(e) {
    console.error(e)
    throw e
  }
}

const deleteFromFirstSubject = async(id: number) => {
  try {
    await http.delete(`api/admin/matrix-subject-to-subject/${firstSubject.value}/${id}`)
  } catch(e) {
    console.error(e)
    throw e
  }
}

onMounted(getSubjectsDictionary)
</script>

<template>
  <Dialog v-model:visible="dialogIsVisible" modal header="Добавить связанный предмет" :style="{ width: '450px' }">
    <div>
      <Listbox
          v-model="listBoxSelectedSubjects"
          :options="notSelectedSubjectsOfFirstSubject"
          multiple
          filter
          optionLabel="name"
          class="w-full"
      />
    </div>
    <template #footer>
      <Button @click="addToFirstSubject">Добавить</Button>
    </template>
  </Dialog>
  <h1>Матрица ЕНТ (Единое национальное тестирование)</h1>
  <div class="mt-8">
    <p class="text-lg">Матрица профильных предметов:</p>
    <div>
      <Dropdown
          v-model="firstSubject"
          :options="allSubjects"
          optionLabel="name"
          option-value="id"
          :loading="isFetching"
          placeholder="Выбрать предмет"
          class="w-full md:w-20rem"
          @change="onFirstSubjectChange"
      />
      <div v-if="firstSubject" style="max-width: 800px">
        <p class="text-sm text-gray-600 font-light">Связанные предметы:</p>
        <div class="flex flex-wrap gap-2">
          <Chip v-for="subject in selectedSubjectsOfFirstSubject" :key="subject.id" :label="subject.name" removable @remove="deleteFromFirstSubject(subject.id)"/>
          <Button
              icon="pi pi-plus"
              rounded
              aria-label="Добавить предмет"
              style="width: 36px; height: 36px"
              size="small"
              @click="openDialog"
          />
        </div>
      </div>
    </div>

    <p class="text-lg mt-6">Матрица предметов по умолчанию:</p>
    <div>
      <Dropdown
          v-model="selectedType"
          :options="testTypes"
          optionLabel="label"
          option-value="value"
          placeholder="Выбрать тип"
          class="w-full md:w-20rem"
          @change="onSecondSubjectChange"
      />
      <div v-if="selectedType" style="max-width: 800px">
        <p class="text-sm text-gray-600 font-light">Предметы по умолчанию:</p>
        <div class="flex flex-column gap-2">
          <div style="max-width: 500px">
            <p v-for="subject in selectedSubjectsOfSecondSubject" :key="subject.id" class="flex align-items-center">
              <span class="flex-1">{{ `${subject.subject.name} | ${subject.questionCount} вопросов` }}</span>
              <i class="pi pi-times text-red-400 ml-auto cursor-pointer" @click="deleteDefaultSubject(subject.subject.id)"></i>
            </p>
          </div>
          <div class="flex align-items-center gap-2">
            <Dropdown
                v-model="defaultSubjectData.subject"
                :options="notSelectedSubjectsOfSecondSubject"
                optionLabel="name"
                option-value="id"
                placeholder="Предмет"
                class="w-full md:w-20rem"
            />
            <InputNumber v-model="defaultSubjectData.questionsCount" mode="decimal" showButtons :min="0" :max="40" />
            <Button icon="pi pi-plus" style="width: 45px; height: 45px" @click="addDefaultSubject"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
