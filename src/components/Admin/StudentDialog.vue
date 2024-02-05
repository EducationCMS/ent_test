<script setup lang="ts">
import { defineModel, reactive, ref, watch } from "vue"
import type { ICity, IRegion, ISchool, IUser } from "@/stores/user"
import Input from "@/components/Form/Input"
import PhoneInput from "@/components/Form/PhoneInput"
import SelectButton from "primevue/selectbutton"
import http from "@/plugins/axios"
import type { AutoCompleteCompleteEvent } from "primevue/autocomplete"
import { isAxiosError } from "axios"

const modelValue = defineModel<boolean>()
const props = defineProps<{
  student?: IUser
}>()
const emits = defineEmits<{
  (e: 'close', refresh?: boolean): void
}>()

const STUDENT_INITIAL_DATA = {
  firstName: '',
  lastName: '',
  middleName: '',
  region: '',
  city: '',
  school: '',
  phoneNumber: '',
  parentsNumbers: [
    {
      id: null,
      role: 'Another',
      number: '1234567890'
    }
  ],
  iin: '',
  permissionForTest: false
}

const student_data = reactive({ ...STUDENT_INITIAL_DATA })
const city = ref()
const region = ref()
const school = ref()
const cities = ref<ICity[]>([])
const regions = ref<IRegion[]>([])
const schools = ref<ISchool[]>([])
const errors = ref<{ [key: string]: string }>({})
const is_saving = ref(false)
const isCreating = ref(false)
const selectOptions = ref([
  { label: 'Жоқ', value: false },
  { label: 'Ия', value: true },
])
const credentials = reactive({
  login: '',
  password: ''
})

watch(() => props.student, (newValue) => {
  if(newValue) {
    Object.assign(student_data, newValue)
    region.value = newValue.region
    city.value = newValue.city
    school.value = newValue.school
  }
})

const searchCity = async(value: AutoCompleteCompleteEvent) => {
  try {
    const { data } = await http.get('api/cities', {
      params: {
        name: value.query,
        regionId: region.value.id
      }
    })
    cities.value = data || []
  } catch(err) {
    cities.value = []
    console.error(err)
    throw err
  }
}

const searchRegion = async(value: AutoCompleteCompleteEvent) => {
  try {
    const { data } = await http.get('api/regions', {
      params: {
        name: value.query
      }
    })
    regions.value = data || []
  } catch(err) {
    regions.value = []
    console.error(err)
    throw err
  }
}

const searchSchool = async(value: AutoCompleteCompleteEvent) => {
  try {
    const { data } = await http.get('api/schools', {
      params: {
        name: value.query,
        cityId: city.value.id
      }
    })
    schools.value = data || []
  } catch(err) {
    schools.value = []
    console.error(err)
    throw err
  }
}

const onSelectCityChange = ({ value }: { value: { id: number, name: string }|string }) => {
  student_data.city = typeof value === "object" ? value.name : value
}
const onSelectRegionChange = ({ value }: { value: { id: number, name: string }|string }) => {
  student_data.region = typeof value === "object" ? value.name : value
}
const onSelectSchoolChange = ({ value }: { value: { id: number, name: string }|string }) => {
  student_data.school = typeof value === "object" ? value.name : value
}

const saveStudent = async() => {
  isCreating.value = true
  try {
    await http.put('api/admin/user-update', student_data)
    emits('close', true)
  } catch(err) {
    if(isAxiosError(err)) {
      // const fieldErrors = err.response?.data?.['fieldErrors'] as IFieldError
      errors.value = err.response?.data?.['fieldErrors'] || {}
    } else {
      console.error(err)
      throw err
    }
  } finally {
    isCreating.value = false
  }
}

// NOTES
// 1. Parents number in user-registration is needed?
const createStudent = async() => {
  errors.value = {}
  isCreating.value = true
  try {
    const { data } = await http.post('api/admin/user-registration', student_data)
    // emits('close', true)
    credentials.login = data?.login ?? ''
    credentials.password = data?.password ?? ''
    // setTimeout(() => {
    //   success_form.value?.scrollIntoView({ behavior: 'smooth' })
    // }, 100)
    // toast.add({ severity: 'success', summary: 'Успешно!', detail: 'Студент қосылды!', life: 3000 });
  } catch(err) {
    if(isAxiosError(err)) {
      // const fieldErrors = err.response?.data?.['fieldErrors'] as IFieldError
      errors.value = err.response?.data?.['fieldErrors'] || {}
    } else {
      console.error(err)
      throw err
    }
  } finally {
    isCreating.value = false
  }
}

const onCloseDialog = (refresh: boolean = false) => {
  Object.assign(student_data, { ...STUDENT_INITIAL_DATA })
  region.value = ''
  city.value = ''
  school.value = ''
  credentials.password = ''
  credentials.login = ''
  emits('close', refresh)
}

</script>

<template>
  <Dialog v-model:visible="modelValue" modal header="Қосу" :style="{ maxWidth: '600px' }" @after-hide="onCloseDialog">
    <div class="formgrid grid" >
      <div class="field col-6">
        <Input
          v-model="student_data.firstName"
          label="Аты"
          :error="errors['firstName']"
        />
      </div>
      <div class="field col-6">
        <Input
          v-model="student_data.lastName"
          label="Жөні"
          :error="errors['lastName']"
        />
      </div>
      <div class="field col-6">
        <Input
          v-model="student_data.middleName"
          label="Тегі (міндетті емес)"
          :error="errors['middleName']"
        />
      </div>
      <div class="field col-12">
        <PhoneInput v-model="student_data.phoneNumber" label="Телефон" :error="errors['phoneNumber']"/>
      </div>
      <div class="field col-12">
        <Input
          v-model="student_data.iin"
          label="ЖСН (ИИН)"
          :error="errors['iin']"
        />
      </div>
      <div class="field col-4">
        <div>
          <label for="region" class="font-semibold block mb-2">Облысы</label>
          <AutoComplete
            v-model="region"
            id="region"
            input-class="w-full"
            class="w-full"
            option-label="name"
            :suggestions="regions"
            @change="onSelectRegionChange"
            @complete="searchRegion"
            :class="[errors['region'] && 'p-invalid']"
          />
          <small v-if="errors['region']" class="p-error" id="region_error">{{ errors['region'] ?? '&nbsp;'  }}</small>
        </div>
      </div>
      <div class="field col-4">
        <div>
          <label for="city" class="font-semibold block mb-2">Қаласы, ауданы</label>
          <AutoComplete
            v-model="city"
            id="city"
            input-class="w-full"
            class="w-full"
            option-label="name"
            :suggestions="cities"
            :disabled="!region"
            @change="onSelectCityChange"
            @complete="searchCity"
            :class="[errors['city'] && 'p-invalid']"
          />
          <small v-if="errors['city']" class="p-error" id="city_error">{{ errors['city'] ?? '&nbsp;'  }}</small>
        </div>
      </div>
      <div class="field col-4">
        <div>
          <label for="school" class="font-semibold block mb-2">Мектебі</label>
          <AutoComplete
            v-model="school"
            id="school"
            input-class="w-full"
            class="w-full"
            option-label="name"
            :suggestions="schools"
            :disabled="!city"
            @change="onSelectSchoolChange"
            @complete="searchSchool"
            :class="[errors['school'] && 'p-invalid']"
          />
          <small v-if="errors['school']" class="p-error" id="school_error">{{ errors['school'] ?? '&nbsp;'  }}</small>
        </div>
      </div>
      <div v-if="credentials.password" class="mt-3 surface-100 border-round w-full flex flex-column align-items-center">
        <p class="text-5xl font-semibold my-4" style="letter-spacing: 3px">{{ credentials.password }}</p>
      </div>
<!--      <div class="field col-4">-->
<!--        <label for="school" class="font-semibold block mb-2">Тест тапсыра алады:</label>-->
<!--        <SelectButton v-model="student_data.permissionForTest" :options="selectOptions" option-label="label" option-value="value" aria-labelledby="basic" />-->
<!--      </div>-->
      <div class="field col-12 flex justify-content-end mt-5 mb-0">
        <Button
          v-if="credentials.password"
          severity="secondary"
          label="Жабу"
          @click="onCloseDialog(true)"
        />
        <Button
          v-else
          label="Сақтау"
          :loading="isCreating"
          @click="student ? saveStudent() : createStudent()"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">

</style>
