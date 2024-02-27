<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from "vue"
import "vue3-circle-progress/dist/circle-progress.css"
import CircleProgress from "vue3-circle-progress"
import RadioButton from "primevue/radiobutton"
import Message from "primevue/message"
import Checkbox from "primevue/checkbox"
import ProgressSpinner from "primevue/progressspinner"
import Image from "primevue/image"
import SpeedDial from "primevue/speeddial"
import { Countdown } from "@vue-layout/countdown"
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"
import { storeToRefs } from "pinia"
import http from "@/plugins/axios"
import { getImageUrl } from "@/helpers/getters"
import ToolsTable from "@/components/ToolsTable"

interface IQuestion {
  id: number,
  question: string,
  mediaFiles: object,
  options: IQuestionOption,
  multipleAnswers: boolean,
}

interface IContextQuestion {
  content: string,
  questions: IQuestion[]
}

interface IQuestionOption {
  id: number,
  checked: boolean,
  text: string,
  value: string
}

interface IQuestionMap {
  contextQuestions: IContextQuestion[],
  multipleQuestions: IQuestion[],
  questions: IQuestion[]
}

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const { GET_STUDENT, LOGOUT_USER } = userStore

const isLoading = ref(false)
const toolsDialogIsVisible = ref(false)
const time = ref(3600 * 1000 * 3.5)
const testId = ref("")
const tests = ref<IQuestionMap[]>()
const testSubjects = ref<string[]>([])
const activeSubjectIndex = ref(0)
const activeQuestionIndex = ref(0)
const status = ref("not-started")
const error = ref("")
const isFinishing = ref(false)
const subjectsResult = ref()
const testScore = ref(0)

const items = ref([
  {
    label: "Ерігіштік кестесі",
    icon: "pi pi-filter",
    command: () => {
      toast.add({ severity: "success", summary: "Update", detail: "Data Updated" })
    }
  },
  {
    label: "Менделеев кестесі",
    icon: "pi pi-table",
    command: () => {
      toast.add({ severity: "info", summary: "Add", detail: "Data Added" })
    }
  }
])

const questions = computed(() => {
  const questionMap = tests.value?.[activeSubjectIndex.value]
  return [
    ...(questionMap?.contextQuestions || []),
    ...(questionMap?.questions || []),
    ...(questionMap?.multipleQuestions || [])
  ]
})
const activeQuestion = computed<IQuestion|IContextQuestion>(() => questions.value?.[activeQuestionIndex.value] ?? {})

const nextSubject = computed(() => {
  let index = activeSubjectIndex.value
  index = index + 1
  return testSubjects.value[index] ?? ""
})
const prevSubject = computed(() => {
  let index = activeSubjectIndex.value
  index = index - 1
  return testSubjects.value[index] ?? ""
})

const getTest = async(id: string) => {
  testId.value = id
  isLoading.value = true
  try {
    const { data } = await http.get("api/ent-test/get-by-id/" + id)
    tests.value = Object.values(data?.questionsMap ?? {}) || []
    testSubjects.value = Object.keys(data?.questionsMap ?? {}) || []
    status.value = "started"
    var dateString = data?.startedDate

// Split the date string into components
    var components = dateString.split(/[\s.:]+/)

// Extract the components
    var day = parseInt(components[0], 10)
    var month = parseInt(components[1], 10) - 1 // Months are zero-based in JavaScript
    var year = parseInt(components[2], 10)
    var hour = parseInt(components[3], 10)
    var minute = parseInt(components[4], 10)
    var second = parseInt(components[5], 10)

// Create a Date object
    const startedDate = new Date(year, month, day, hour, minute, second)
    const currentDate = new Date()

    const timeDifference = currentDate.getTime() - startedDate.getTime()
    if(timeDifference) time.value = time.value - timeDifference
  } catch(e) {
    console.error(e)
    error.value = "Тест не найден"
    throw e
  } finally {
    isLoading.value = false
  }
}

const createAnswer = async(questionId: number, optionId: number) => {
  try {
    await http.post("api/ent-test/answer", {
      testUserId: user.value?.id,
      entTestId: testId.value,
      questionId,
      optionId
    })
  } catch(e) {
    console.error(e)
    throw e
  }
}

const deleteAnswer = async(questionId: number, optionId: number) => {
  try {
    await http.delete("api/ent-test/answer", {
      data: {
        entTestId: testId.value,
        questionId,
        optionId
      }
    })
  } catch(e) {
    console.error(e)
    throw e
  }
}

const finishTest = async() => {
  isFinishing.value = true
  try {
    const { data } = await http.put("api/ent-test/end/" + testId.value)
    console.log("FINISH", data)
    await getTestResult()
  } catch(e) {
    console.error(e)
    throw e
  } finally {
    isFinishing.value = false
  }
}

const getTestResult = async() => {
  try {
    const { data } = await http.get("api/ent-test/result")
    testScore.value = data?.totalResult.score ?? 0
    subjectsResult.value = data?.subjectsResult ?? []
    status.value = "finished"
  } catch(e) {
    console.error(e)
    throw e
  }
}

const onOptionClick = (checked: boolean, questionId: number, optionId: number) => {
  if(checked) createAnswer(questionId, optionId)
  else deleteAnswer(questionId, optionId)
}

const closeTest = () => {
  LOGOUT_USER()
  router.push({ name: "Home" })
}

onMounted(() => {
  const token = window.sessionStorage.getItem("@access-token")
  if(token) GET_STUDENT()

  const id = route.params.id as string
  if(!id) error.value = "Test ID not found"
  else getTest(id)
})
// onBeforeMount(() => {
//   window.onbeforeunload = function(){
//     return true;
//   }
// })
// onBeforeRouteLeave((to, from, next) => {
//   if(status.value === 'started') {
//     const result = confirm('Are you sure about that?')
//     next(result)
//   } else next()
// })
</script>

<template>
  <div class="flex flex-column h-screen">
    <template v-if="!!error">
      <Message :closable="false" severity="error" class="m-4">{{ error }}</Message>
    </template>
    <template v-else-if="isLoading">
      <div class="flex justify-content-center py-7">
        <ProgressSpinner />
      </div>
    </template>
    <template v-else-if="status === 'started'">
      <ToolsTable v-model="toolsDialogIsVisible"/>
      <Button
        class="fixed"
        style="bottom: 1rem; right: 1rem; width: 4rem; height: 4rem"
        size="large"
        rounded
        icon="pi pi-wrench text-xl"
        aria-label="Инструменты"
        @click="toolsDialogIsVisible = true"
      />
<!--      <SpeedDial-->
<!--        :model="items"-->
<!--        :radius="120"-->
<!--        direction="up"-->
<!--        show-icon="pi pi-wrench text-xl"-->
<!--        hide-icon="pi pi-times text-xl"-->
<!--        :style="{ right: '1rem', bottom: '1rem', position: 'fixed' }"-->
<!--        :tooltip-options="{ position: 'right' }"-->
<!--      />-->
      <div class="md:p-8 p-3">
        <div class="flex align-items-center justify-content-between mob-timer">
          <h2 class="mt-0 md:text-2xl text-base mb-4 ">{{ testSubjects.at(activeSubjectIndex) ?? "" }}</h2>
          <Countdown
            :auto-start="true"
            :emit-events="true"
            :interval="1000"
            :time="time"
            @end="finishTest"
          >
            <template #default="props: { hours: number, minutes: number, seconds: number }">
            <span class="font-semibold text-xl">
                {{ props.hours }} : {{ props.minutes }} : {{ props.seconds }}
            </span>
            </template>
          </Countdown>
        </div>
        <div class="flex flex-wrap gap-1">
          <div
            v-for="(question, idx) in questions"
            :key="question.id"
            class="test__question_index cursor-pointer"
            :class="{ 'test__question_index--active': activeQuestionIndex === idx }"
            @click="activeQuestionIndex = idx"
          >
            {{ idx + 1 }}
          </div>
        </div>
        <div class="mt-5">
          <template v-if="activeQuestion.content">
            <p class="md:text-xl text-base mb-5 ">{{ activeQuestionIndex + 1 }}.
              <span v-html="activeQuestion.content"></span>
            </p>
            <div v-for="(question, qIdx) in activeQuestion.questions || []" :key="`context-${qIdx}`">
              <p class="md:text-lg text-base mb-4">{{ qIdx + 1 }}. {{ question.question }}</p>
              <div class="flex flex-column gap-3">
                <template v-if="!question.multipleAnswers">
                  <div
                    v-for="(option, oIdx) in question.options"
                    :key="option.id"
                    class="flex align-items-center cursor-pointer"
                  >
                    <RadioButton
                      v-model="question.checkedAnswers[0]"
                      :inputId="`option_${question.id}-${option.id}`"
                      name="category"
                      :value="option.id"
                      @change="createAnswer(question.id, option.id)"
                    />
                    <label
                      :for="`option_${question.id}-${option.id}`"
                      class="ml-2"
                    >{{ String.fromCharCode(65 + oIdx) }}) {{ option.text }}</label>
                  </div>
                </template>
                <template v-else>
                  <div
                    v-for="(option, oIdx) in question.options"
                    :key="option.id"
                    class="flex align-items-center cursor-pointer"
                  >
                    <Checkbox
                      v-model="question.checkedAnswers"
                      :inputId="`option_${question.id}-${option.id}`"
                      name="category"
                      :value="option.id"
                      @input="event => onOptionClick(event.includes(option.id), activeQuestion.id, option.id)"
                    />
                    <label
                      :for="`option_${question.id}-${option.id}`"
                      class="ml-2"
                    >{{ String.fromCharCode(65 + oIdx) }}) {{ option.text }}</label>
                  </div>
                </template>
              </div>
            </div>
          </template>
          <template v-else>
            <p class="md:text-xl text-base">{{ activeQuestionIndex + 1 }}. {{ activeQuestion.question }}</p>
            <p
              v-if="activeQuestion.multipleAnswers"
              class="font-medium text-sm text-gray-500"
            >На вопрос есть несколько ответов</p>
            <Image
              v-if="activeQuestion.mediaFiles && activeQuestion.mediaFiles[0]"
              preview
              :src="getImageUrl(activeQuestion.mediaFiles[0].url)"
              image-style="max-width: 100%; height: auto"
              class="mb-5"
            />
            <div class="flex flex-column gap-3 mt-5">
              <template v-if="!activeQuestion.multipleAnswers">
                <div
                  v-for="(option, oIdx) in activeQuestion.options"
                  :key="option.id"
                  class="flex align-items-center cursor-pointer"
                >
                  <RadioButton
                    v-model="activeQuestion.checkedAnswers[0]"
                    :inputId="`option_${activeQuestion.id}-${option.id}`"
                    name="radio-option"
                    :value="option.id"
                    @change="createAnswer(activeQuestion.id, option.id)"
                  />
                  <label
                    :for="`option_${activeQuestion.id}-${option.id}`"
                    class="ml-2"
                  >{{ String.fromCharCode(65 + oIdx) }}) {{ option.text }}</label>
                </div>
              </template>
              <template v-else>
                <div
                  v-for="(option, oIdx) in activeQuestion.options"
                  :key="option.id"
                  class="flex align-items-center cursor-pointer"
                >
                  <Checkbox
                    v-model="activeQuestion.checkedAnswers"
                    :inputId="`option_${activeQuestion.id}-${option.id}`"
                    name="checkbox-option"
                    :value="option.id"
                    :aria-label="`${String.fromCharCode(65 + oIdx)}) ${option.text}`"
                    @input="event => onOptionClick(event.includes(option.id), activeQuestion.id, option.id)"
                  />
                  <label
                    :for="`option_${activeQuestion.id}-${option.id}`"
                    class="ml-2"
                  >{{ String.fromCharCode(65 + oIdx) }}) {{ option.text }}</label>
                </div>
              </template>
            </div>
          </template>
        </div>
        <div class="flex align-items-center gap-3 mt-7">
          <Button
            icon="pi pi-chevron-left"
            class="bg-green-100 text-green-500"
            text
            :disabled="activeQuestionIndex === 0"
            @click="activeQuestionIndex--"
          />
          <Button
            icon="pi pi-chevron-right"
            class="bg-green-100 text-green-500"
            text
            :disabled="activeQuestionIndex === questions.length-1"
            @click="activeQuestionIndex++"
          />
        </div>
        <div class="md:mt-6 mt-4 flex flex-wrap mob-buttons">
          <Button
            :label="prevSubject"
            icon="pi pi-chevron-left"
            :disabled="!prevSubject"
            @click="activeSubjectIndex--; activeQuestionIndex = 0"
          />
          <Button
            :label="nextSubject"
            :disabled="!nextSubject"
            icon-pos="right"
            icon="pi pi-chevron-right"
            class="ml-3"
            @click="activeSubjectIndex++; activeQuestionIndex = 0"
          />
          <Button
            severity="danger"
            label="Завершить"
            class="ml-auto md:w-auto w-full md:mt-0 mt-4"
            :loading="isFinishing"
            @click="finishTest"
          />
        </div>
      </div>
    </template>
    <template v-else-if="status === 'finished'">
      <div class="flex flex-column align-items-center">
        <h1 class="mb-6">Результат теста</h1>
        <CircleProgress
          size="150"
          :percent="testScore"
          show-percent
          border-bg-width="20"
          border-width="20"
          fill-color="#52CD9F"
        >0%
        </CircleProgress>
        <div class="flex flex-column mt-5">
          <div
            v-for="result in subjectsResult"
            :key="result.subjectName"
            class="flex align-items-center justify-content-between md:w-30rem w-20rem md:text-xl text-base border-bottom-1 border-300 py-4"
          >
            <span>{{ result.subjectName }}</span>
            <span>{{ result.score }}</span>
          </div>
        </div>
        <Button
          label="Завершить"
          class="mt-5"
          size="large"
          @click="closeTest"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.current-counter {
  font-size: 2.5rem;
  font-weight: 600;
}

.test__question {
  &_index {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    font-weight: 500;
    opacity: 0.4;
    color: #FFF;
    border-radius: 100%;
    background-color: var(--primary-500);

    &--active {
      opacity: 1;
    }

    &--disabled {
      background-color: #C3C1C1;
    }
  }
}

.p-speeddial-action-icon {
  transform: rotate(180deg);
}

// mobile adapter добавил значения для классов в

$mobile-breakpoint: 480px;

@media screen and (max-width: $mobile-breakpoint) {

  .mob-buttons{
    .p-button-label{
      display: none;
    }
    .p-button-danger{
      .p-button-label{
        display: block;
      }

      width: 80% !important;
      margin-left: 0 !important;
    }
  }

  .mob-timer{
    .text-xl{
      font-size: 1rem !important;
    }
  }
}

</style>
