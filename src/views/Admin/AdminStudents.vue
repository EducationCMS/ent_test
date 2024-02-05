<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import http from "@/plugins/axios"
import StudentDialog from "@/components/Admin/StudentDialog.vue"
import ToggleButton from "primevue/togglebutton"
import type { IUser } from "@/stores/user"
import Paginator, { type PageState } from "primevue/paginator"

const page = ref(1)
const size = ref(10)
const isSearching = ref(false)
const dialogIsVisible = ref(false)
const students = ref([])
const studentsCount = ref(0)
const editableStudent = ref<IUser>()
const search = ref("")
const regions = ref([])
const cities = ref([])
const schools = ref([])
const selectedRegion = ref(null)
const selectedCity = ref(null)
const selectedSchool = ref(null)
const delayTimer = ref<ReturnType<typeof setTimeout>>()

// watch(() => search.value, () => {
//   clearTimeout(delayTimer.value)
//   delayTimer.value = setTimeout(() => {
//     getStudents()
//   }, 300)
// })

const getStudents = async() => {
  isSearching.value = true
  try {
    const { data } = await http.get("api/admin/user-get-all", {
      params: {
        query: search.value,
        page: page.value,
        size: size.value,
        ...(selectedCity.value ? { cityId: selectedCity.value } : {}),
        ...(selectedRegion.value ? { regionId: selectedRegion.value } : {}),
        ...(selectedSchool.value ? { schoolId: selectedSchool.value } : {})
      }
    })
    students.value = data?.items ?? []
    studentsCount.value = data?.totalCount ?? 0
  } catch(e) {
    console.error(e)
    throw e
  } finally {
    isSearching.value = false
  }
}

const editUser = (user: IUser) => {
  editableStudent.value = user
  dialogIsVisible.value = true
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

const togglePermission = async(event: boolean, user: IUser) => {
  try {
    const { data } = await http.put(`api/admin/${event ? "give" : "get"}-permission-by-id/${user.id}`)
    user.permissionForTest = data?.permissionForTest ?? false
  } catch(e) {
    console.error(e)
    throw e
  }
}

const onCloseDialog = (refresh?: boolean) => {
  if(refresh) getStudents()
  editableStudent.value = undefined
  dialogIsVisible.value = false
}

const onPageChange = (event: PageState) => {
  page.value = event.page + 1
  getStudents()
}

onMounted(() => {
  getStudents()
  getDictionaryItemList()
})
</script>

<template>
  <StudentDialog v-model:model-value="dialogIsVisible" :student="editableStudent" @close="onCloseDialog" />
  <div class="flex justify-content-between align-items-center">
    <h1>Студенты тестирования</h1>
    <Button
        label="Добавить студента"
        @click="dialogIsVisible = true"
    />
  </div>
  <p class="text-lg">Всего студентов: {{ studentsCount }}</p>
  <form class="flex justify-content-end gap-3" @submit.prevent="getStudents">
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
      class="mt-6 mb-3"
      :loading="isSearching"
  >
    <template #empty>
      <p class="text-gray-600 text-center">Студенты не найдены</p>
    </template>
    <Column header="Имя студента">
      <template #body="slotProps">
        <span>{{ `${slotProps.data.lastName ?? ""} ${slotProps.data.firstName ?? ""}` }}</span>
      </template>
    </Column>
    <Column header="Школа">
      <template #body="slotProps">
        <span>{{ `${slotProps.data.school.name}` }}</span>
      </template>
    </Column>
    <Column field="region.name" header="Область, район"></Column>
    <Column field="iin" header="ИИН"></Column>
    <Column field="phoneNumber" header="Номер">
      <template #body="slotProps">
        {{ `+7${slotProps.data.phoneNumber}` }}
      </template>
    </Column>
    <Column header="Разрешение на УНТ">
      <template #body="slotProps">
        <ToggleButton
            :model-value="slotProps.data.permissionForTest"
            on-label="Да"
            off-label="Нет"
            @update:model-value="togglePermission($event, slotProps.data)"
        />
      </template>
    </Column>
    <Column field="email" header="">
      <template #body="slotProps">
        <Button
            size="small"
            class="bg-green-100 text-green-500"
            text
            label="Редактировать"
            style="height: 36px"
            severity="success"
            @click="editUser(slotProps.data)"
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
