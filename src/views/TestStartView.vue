<script setup lang="ts">
import { onMounted, ref } from "vue"
import Message from "primevue/message"
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"
import { storeToRefs } from "pinia"
import http from "@/plugins/axios"
import type { DropdownChangeEvent } from "primevue/dropdown"
import type { AxiosError } from "axios"

const router = useRouter()

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const { GET_STUDENT, LOGOUT_USER } = userStore

const subjectOne = ref()
const subjectTwo = ref()
const status = ref("not-started")
const error = ref("")
const firstSubjects = ref([])
const secondSubjects = ref([])
const isSubjectsLoading = ref(false)
const isGenerating = ref(false)

const classes = ref([])
const classesIsLoading = ref(false)
const selectedClass = ref()

const onFirstSubjectChange = (event: DropdownChangeEvent) => {
  const subjectId = event.value
  getSecondSubjects(subjectId)
}

const getSubjects = async() => {
  isSubjectsLoading.value = true
  try {
    const { data } = await http.get("api/ent-test/subjects")
    firstSubjects.value = data ?? []
  } catch(e) {
    console.error(e)
    throw e
  } finally {
    isSubjectsLoading.value = false
  }
}

const getClasses = async() => {
  classesIsLoading.value = true
  try {
    const { data } = await http.get('api/school-test/school-classes')
    classes.value = data || []
  } catch(e) {
    console.error(e)
    throw e
  } finally {
    classesIsLoading.value = false
  }
}

const getSecondSubjects = async(subjectId: number) => {
  isSubjectsLoading.value = true
  try {
    const { data } = await http.get("api/ent-test/subjects-in-mss", {
      params: { subjectId }
    })
    secondSubjects.value = data ?? []
  } catch(e) {
    console.error(e)
    throw e
  } finally {
    isSubjectsLoading.value = false
  }
}

const generateTest = async(type: 'SURVIVAL'|'CREATIVE') => {
  isGenerating.value = true
  try {
    const { data } = await http.post("api/ent-test/generate", {
      testUserId: user.value?.id,
      firstSubjectId: subjectOne.value,
      secondSubjectId: subjectTwo.value,
      type
    })
    // testId.value = data?.id
    await router.push({ name: 'Test', params: { id: data?.id } })
    // tests.value = Object.values(data?.questionsMap ?? {}) || []
    // testSubjects.value = Object.keys(data?.questionsMap ?? {}) || []
    // status.value = "started"
  } catch(e) {
    const err = e as AxiosError
    error.value = err.response.data?.detail || "Ошибка сервера!"
    console.error(e)
    throw e
  } finally {
    isGenerating.value = false
  }
}

onMounted(() => {
  const token = window.sessionStorage.getItem('@access-token')
  if(token) GET_STUDENT()
  getSubjects()
  getClasses()
})
</script>

<template>
  <div class="flex flex-column h-screen">
    <div class="md:px-6 px-3 flex align-items-center justify-content-between">
      <h1
          class="layout__sidebar__logo cursor-pointer align-self-center mb-4"
          @click="router.push({ name: 'Home' })"
      >
        TestKenes
      </h1>
      <div class="flex align-items-center gap-4">
        <div v-if="user" class="flex align-items-center cursor-pointer py-3">
          <Avatar :label="`${user?.lastName.charAt(0)}${user?.firstName.charAt(0)}`" class="mr-2 text-lg" size="large" shape="circle" />
          <div>
            <p class="my-0 font-semibold">{{ user?.lastName ?? "" }} {{ user?.firstName ?? "" }}</p>
            <p class="my-0 font-medium text-gray-500">{{ user?.iin ?? "" }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-1 flex flex-column align-items-center pb-6">
      <h1>Онлайн тест</h1>
      <div class="grid justify-content-evenly" style="max-width: 800px; width: 100%">
        <div  v-if="!!error" class="col-12">
          <Message :closable="false" severity="error">{{ error }}</Message>
        </div>
        <div class="col-12 md:col-5">
          <div class="border-3 border-primary-500 border-round-2xl px-4 pb-4">
            <p class="text-center text-3xl font-semibold">ЕНТ</p>
            <div class="flex flex-column">
              <Dropdown
                v-model="subjectOne"
                :options="firstSubjects"
                option-label="name"
                option-value="id"
                placeholder="Первый предмет"
                @change="onFirstSubjectChange"
              />
              <Dropdown
                v-model="subjectTwo"
                :options="secondSubjects"
                option-label="name"
                option-value="id"
                class="mt-3"
                :loading="isSubjectsLoading"
                :disabled="!subjectOne"
                placeholder="Второй предмет"
              />
            </div>
            <Button
              class="mt-5 w-full"
              :disabled="!subjectTwo || !subjectOne"
              :loading="isGenerating"
              label="Начать тест"
              @click="generateTest('SURVIVAL')"
            />
            <div class="border-top-1 border-gray-300 mt-4">
              <p class="font-medium text-center text-gray-700 uppercase">Творческий Экзамен</p>
              <Button
                class="w-full"
                :loading="isGenerating"
                label="Начать тест"
                @click="generateTest('CREATIVE')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">



</style>
