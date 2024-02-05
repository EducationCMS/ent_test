<script setup lang="ts">
import Button from "primevue/button"
import { onMounted, reactive, ref, watch } from "vue"
import http from "@/plugins/axios"
import Input from "@/components/Form/Input.vue"
import Checkbox from "primevue/checkbox"

interface ISubject {
  id: number,
  name: string,
  createdDate: string,
  modules: any[],
}

interface IClass {
  id: number,
  name: string,
  testTimeLimit: null,
  createdDate: string,
  timeInMilliseconds: number
}

interface ISchoolMatrix {
  type: string,
  isContext: boolean,
  questionCount: number,
  contextQuestionCount: number,
  multipleQuestionCount: number,
  subject: ISubject,
  schoolClass: IClass
}

const TYPES = [
  { value: 'READING_LITERACY', name: 'Грамотность чтения' },
  { value: 'MATHEMATICAL_LITERACY', name: 'Математическая грамотность' },
  { value: 'NATURAL_SCIENCE_LITERACY', name: 'Естественнонаучная грамотность' },
]

const isLoading = ref(false)
const isSaving = ref(false)
const classes = ref([])
const subjects = ref([])
const matrices = ref<ISchoolMatrix[]>([])
const selectedClass = ref()
const selectedType = ref()
const selectedSubject = ref()
const form = reactive({
  isContext: false,
  questionCount: 0,
  contextQuestionCount: 0,
  multipleQuestionCount: 0,
})

watch(() => [selectedClass.value, selectedType.value], ([newClass, newType]) => {
  if(newClass && newType) getMatrix(newClass, newType)
})

const getClasses = async() => {
  isLoading.value = true
  try {
    const { data } = await http.get('api/dictionary/school-class')
    classes.value = data || []
  } catch(e) {
    console.error(e)
    throw e
  } finally {
    isLoading.value = false
  }
}

const getSubjects = async() => {
  isLoading.value = true
  try {
    const { data } = await http.get('api/dictionary/subjects')
    subjects.value = data || []
  } catch(e) {
    console.error(e)
    throw e
  } finally {
    isLoading.value = false
  }
}

const getMatrix = async(id: number, type: string) => {
  try {
    const { data } = await http.get(`api/admin/subjects-in-mscs/${id}/${type}`)
    matrices.value = data || []
  } catch(e) {
    console.error(e)
    throw e
  }
}

const saveMatrix = async() => {
  isSaving.value = true
  try {
    await http.post('api/admin/matrix-school-class-to-subject', {
      subject: { id: selectedSubject.value },
      schoolClass: { id: selectedClass.value },
      type: selectedType.value,
      ...form
    })
    await getMatrix(selectedClass.value, selectedType.value)
    Object.assign(form, {
      isContext: false,
      questionCount: 0,
      contextQuestionCount: 0,
      multipleQuestionCount: 0,
    })
    selectedSubject.value = undefined
  } catch(e) {
    console.error(e)
    throw e
  } finally {
    isSaving.value = false
  }
}

const editMatrix = (matrix: ISchoolMatrix) => {
  selectedSubject.value = matrix.subject.id
  Object.assign(form, matrix)
}

onMounted(() => {
  getClasses()
  getSubjects()
})
</script>

<template>
  <h1>Матрица ОЦБ (Обобщенные цифровые компетенции)</h1>
  <div class="mt-8">
    <p class="text-lg">Матрица:</p>
    <div class="flex gap-3">
      <Dropdown
          v-model="selectedClass"
          :options="classes"
          optionLabel="name"
          option-value="id"
          :loading="isLoading"
          placeholder="Выбрать класс"
          class="w-full md:w-20rem"
      />
      <Dropdown
          v-model="selectedType"
          :options="TYPES"
          optionLabel="name"
          option-value="value"
          :loading="isLoading"
          placeholder="Выбрать тип"
          class="w-full md:w-20rem"
      />
    </div>
    <div v-if="selectedType && selectedClass" style="max-width: 800px" class="my-5">
      <div>
        <p class="text-lg">Предметы:</p>
        <div v-for="matrix in matrices" :key="matrix.id" class="grid surface-100 border-round-lg p-1 mt-3">
          <div class="col-11">
            <div class="flex flex-column gap-2">
              <p class="m-0 text-lg"><b>Название:</b> {{ matrix.subject.name }}</p>
              <p class="m-0 text-lg"><b>Групповой:</b> {{ matrix.isContext ? 'Да' : 'Нет' }}</p>
              <p class="m-0 text-lg"><b>Кол-во вопросов:</b> {{ matrix.questionCount }}</p>
              <p class="m-0 text-lg"><b>Кол-во multiple вопросов:</b> {{ matrix.multipleQuestionCount }}</p>
              <p class="m-0 text-lg"><b>Кол-во context вопросов:</b> {{ matrix.contextQuestionCount }}</p>
            </div>
          </div>
          <div class="col">
            <Button
                size="small"
                icon="pi pi-pencil"
                @click="editMatrix(matrix)"
            />
          </div>
        </div>
        <div class="grid surface-100 border-round-lg p-1 mt-3">
          <div class="col-12">
            <div class="flex align-items-center gap-3">
              <Dropdown
                  v-model="selectedSubject"
                  :options="subjects"
                  option-label="name"
                  option-value="id"
                  placeholder="Выбрать предмет"
                  class="w-full md:w-20rem"
              />
              <div>
                <Checkbox v-model="form.isContext" binary input-id="isContext" />
                <label for="isContext" class="ml-2 text-lg cursor-pointer">Групповой</label>
              </div>
            </div>
          </div>
          <div class="md:col-4 col-12">
            <Input
                v-model="form.questionCount"
                label="Количество вопросов"
            />
          </div>
          <div class="md:col-4 col-12">
            <Input
                v-model="form.multipleQuestionCount"
                label="Количество multiple вопросов"
            />
          </div>
          <div v-if="form.isContext" class="md:col-4 col-12">
            <Input
                v-model="form.contextQuestionCount"
                label="Количество context вопросов"
            />
          </div>
          <div class="col-12">
            <div class="flex justify-content-end">
              <Button
                  label="Сохранить"
                  :loading="isSaving"
                  @click="saveMatrix"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
