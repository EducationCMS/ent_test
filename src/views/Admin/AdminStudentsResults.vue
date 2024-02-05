<script setup lang="ts">
import { onMounted, ref } from "vue"
import http from "@/plugins/axios"
import { type IUser, useUserStore } from "@/stores/user"
import { storeToRefs } from "pinia"
import type { PageState } from "primevue/paginator"
import Paginator from "primevue/paginator"

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const page = ref(1)
const size = ref(10)
const students = ref([])
const studentsCount = ref(0)
const isLoading = ref(false)
const isDownloading = ref(false)
const isSearching = ref(false)
const search = ref("")
const regions = ref([])
const cities = ref([])
const schools = ref([])
const selectedRegion = ref(null)
const selectedCity = ref(null)
const selectedSchool = ref(null)

const getTestResults = async() => {
  isLoading.value = true
  try {
    const { data } = await http.get('api/ent-test/get-all', {
      params: {
        page: page.value,
        size: size.value,
        query: search.value,
        ...(selectedCity.value ? { cityId: selectedCity.value } : {}),
        ...(selectedRegion.value ? { regionId: selectedRegion.value } : {}),
        ...(selectedSchool.value ? { schoolId: selectedSchool.value } : {})
      }
    })
    students.value = data?.items
    studentsCount.value = data?.totalCount ?? 0
  } catch(e) {
    console.error(e)
    throw e
  } finally {
    isLoading.value = false
  }
}

const getDictionaryItem = async(name: IDictionaryItemName) => {
  try {
    const { data } = await http.get(`api/dictionary/${name}`)
    return data || []
  } catch(e) {
    console.error(e)
    throw e
  }
}

const getDictionaryItemList = async() => {
  cities.value = await getDictionaryItem("cities")
  regions.value = await getDictionaryItem("regions")
  schools.value = await getDictionaryItem("schools")
}

const exportPDF = async(testId: number, user: IUser, passedDate: string) => {
  console.log(testId, user, passedDate)
  const { id } = user
  if(id) {
    isDownloading.value = true
    try {
      const data = await http.get(`api/ent-test/result/pdf/${testId}`, {
        responseType: 'blob'
      })
      let fileName = data.headers.get("Content-Disposition").split('filename=')[1]
      fileName = decodeURIComponent(fileName.replaceAll('"', ""))
      console.log(fileName)
      const fileType = data.headers["Content-Type"]
      const url = window.URL.createObjectURL(data?.data);
      let docUrl = document.createElement('a');
      docUrl.href = url;
      docUrl.download = fileName
      docUrl.type = fileType
      document.body.appendChild(docUrl);
      docUrl.click();
    } catch(e) {
      console.error(e)
      throw e
    } finally {
      isDownloading.value = false
    }
  }
}

const onPageChange = (event: PageState) => {
  page.value = event.page + 1
  getTestResults()
}

onMounted(() => {
  getDictionaryItemList()
  getTestResults()
})
</script>

<template>
  <div class="flex align-items-center justify-content-between">
    <h1>Результаты тестирования студентов</h1>
  </div>
  <p class="text-lg">Всего студентов: {{ studentsCount }}</p>
  <form class="flex justify-content-end gap-3" @submit.prevent="getTestResults">
    <div class="flex-1">
      <span class="p-input-icon-left w-full">
        <i v-if="isSearching" class="pi pi-spin pi-spinner" />
        <i v-else class="pi pi-search" />
        <InputText v-model="search" placeholder="Поиск" type="search" class="w-full" />
      </span>
    </div>
    <Dropdown
        v-model="selectedCity"
        placeholder="Город, район, село"
        :options="cities"
        option-label="name"
        option-value="id"
        show-clear
        :disabled="cities.length === 0"
    />
    <Dropdown
        v-model="selectedRegion"
        placeholder="Область"
        :options="regions"
        option-label="name"
        option-value="id"
        show-clear
        :disabled="regions.length === 0"
    />
    <Dropdown
        v-model="selectedSchool"
        placeholder="Школа"
        :options="schools"
        option-label="name"
        option-value="id"
        show-clear
        :disabled="schools.length === 0"
    />
    <Button
        label="Применить"
        :loading="isSearching"
        type="submit"
    />
  </form>
  <DataTable
      :value="students"
      striped-rows
      show-gridlines
      :loading="isLoading"
      class="mt-6 mb-3"
  >
    <template #empty>
      <p class="text-gray-600 text-center">Менеджеры не найдены</p>
    </template>
    <Column field="name" header="Имя студента">
      <template #body="slotProps">
        <span>{{ slotProps.data?.testUser?.lastName }} {{ slotProps.data?.testUser?.firstName }}</span>
      </template>
    </Column>
    <Column field="school" header="Школа">
      <template #body="slotProps">
        <span>{{ slotProps.data?.testUser?.school?.name ?? '-' }}</span>
      </template>
    </Column>
    <Column field="region" header="Область, район">
      <template #body="slotProps">
        <span>{{ slotProps.data?.testUser?.region?.name ?? '-' }}, {{ slotProps.data?.testUser?.city?.name ?? '-' }}</span>
      </template>
    </Column>
    <Column field="score" header="Балл">
      <template #body="slotProps">
        <span>{{ slotProps.data?.totalResult?.score }}/{{ slotProps.data?.totalResult?.maxScore }}</span>
      </template>
    </Column>
    <Column field="subjects" header="Основные предметы">
      <template #body="slotProps">
        <span>{{ slotProps.data.subjects.join(", ") }}</span>
      </template>
    </Column>
    <Column field="passedDate" header="Дата прохождения"/>
    <Column header="">
      <template #body="slotProps">
        <Button
            size="small"
            class="bg-green-100 text-green-500"
            text
            label="PDF"
            style="height: 36px"
            severity="success"
            :loading="isDownloading"
            @click="exportPDF(slotProps.data.id, slotProps.data.testUser, slotProps.data?.passedDate)"
        />
      </template>
    </Column>
  </DataTable>
  <Paginator
      v-model="page"
      :rows="size"
      :total-records="studentsCount"
      class="mb-5"
      @page="onPageChange"
  />
</template>

<style scoped lang="scss">

</style>
