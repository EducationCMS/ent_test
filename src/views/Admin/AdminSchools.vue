<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import http from "@/plugins/axios"
import ToggleButton from "primevue/togglebutton"
import type { ISchool, IUser } from "@/stores/user"

const search = ref("")
const cities = ref([])
const schools = ref([])
const selectedCity = ref(null)
// const delayTimer = ref<ReturnType<typeof setTimeout>>()

// watch(() => search.value, () => {
//   clearTimeout(delayTimer.value)
//   delayTimer.value = setTimeout(() => {
//     getSchools()
//   }, 300)
// })

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
  schools.value = await getDictionaryItem("schools")
}

const togglePermission = async(event: boolean, school: ISchool) => {
  try {
    const { data } = await http.put(`api/admin/schools/${event ? "give" : "get"}-permission-by-id/${school.id}`)
    school.permissionForTest = data?.permissionForTest ?? false
  } catch(e) {
    console.error(e)
    throw e
  }
}

const getSchools = async() => {
  try {
    const { data } = await http.get("api/dictionary/schools", {
      params: {
        cityId: selectedCity.value,
        name: search.value
      }
    })
    schools.value = data ?? []
  } catch(e) {
    console.error(e)
    throw e
  }
}

const getCityAndRegion = (school: ISchool) => {
  return `${school.city?.name ?? "-"}, ${school.city?.region?.name ?? "-"}`
}

onMounted(() => {
  getSchools()
  getDictionaryItemList()
})
</script>

<template>
  <div class="flex justify-content-between align-items-center">
    <h1 class="mb-0">Школы</h1>
    <!--    <Button-->
    <!--      label="Добавить студента"-->
    <!--      @click="dialogIsVisible = true"-->
    <!--    />-->
  </div>
  <div class="flex justify-content-between">
    <p class="text-lg">Всего школ: {{ schools.length }}</p>
  </div>
  <form class="flex align-items-center gap-3" @submit.prevent="getSchools">
    <div>
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <InputText v-model="search" placeholder="Поиск" type="search" />
      </span>
    </div>
    <Dropdown
        v-model="selectedCity"
        placeholder="Город"
        :options="cities"
        option-label="name"
        option-value="id"
        show-clear
    />
    <Button
        label="Применить"
        type="submit"
    />
  </form>
  <DataTable
      :value="schools"
      striped-rows
      show-gridlines
      class="mt-6"
  >
    <template #empty>
      <p class="text-gray-600 text-center">Школы не найдены</p>
    </template>
    <Column header="Школа">
      <template #body="slotProps">
        <span>{{ `№${slotProps.data.name}` }}</span>
      </template>
    </Column>
    <Column field="region.name" header="Область, район">
      <template #body="slotProps">
        <span>{{ getCityAndRegion(slotProps.data) }}</span>
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
  </DataTable>
</template>

<style scoped lang="scss">

</style>
