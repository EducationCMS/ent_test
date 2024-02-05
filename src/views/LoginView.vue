<script setup lang="ts">
import { useRouter } from "vue-router"
import { ref } from "vue"
import { useUserStore } from "@/stores/user"
import type { AxiosError } from "axios"
import Message from "primevue/message"
import http from "@/plugins/axios"

const router = useRouter()
const { LOGIN_STUDENT } = useUserStore()
// const { layout, SET_LAYOUT } = useSettings()
// const { SET_USER, SET_TOKEN } = useSession()

const is_loading = ref(false)
const iin = ref("")
const password = ref("")
const error = ref("")

const handleRouteChange = (role: string) => {
  const routeName = {
    'ROLE_STUDENT': 'Test',
    'ROLE_ADMIN': 'AdminStudents',
  }[role]
  router.push({ name: routeName })
}

const authorize = async() => {
  is_loading.value = true
  error.value = ""
  // if(email.value === 'student@bilim-lab.kz')
  //   await router.push({ name: 'Test' })
  // else if(email.value === 'admin@bilim-lab.kz')
  //   await router.push({ name: 'AdminStudents' })
  // try {
  //   await LOGIN_USER({
  //     email: email.value,
  //     password: password.value
  //   })
  //   await router.push({ name: 'AdminAnalytics' })
  // } catch(e) {
  //   const errors = e as AxiosError
  //   error.value = errors.response.data?.detail || 'Ошибка!'
  // } finally {
  //   is_loading.value = false
  // }

  try {
    await LOGIN_STUDENT({
      iin: iin.value,
      password: password.value
    })
    await router.push({ name: 'TestStart' })
    // handleRouteChange(user?.appRole.name)
  } catch(err) {
    const errors = err as AxiosError
    error.value = errors.response?.data?.['detail'] || "Ошибка!"
    throw err
  } finally {
    is_loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-column justify-content-center h-screen">
    <div class="flex justify-content-center flex-grow-1">
      <div class="login px-5 pt-3 pb-5 my-auto">
        <p class="text-lg font-semibold mb-6">Добро пожаловать на платформу Vanres</p>
        <div class="flex flex-column gap-2 mb-4">
          <label for="iin" class="font-light">Введите ИИН</label>
          <InputText v-model="iin" id="iin" placeholder="ИИН" />
        </div>
        <div class="flex flex-column gap-2 mb-3">
          <label for="password" class="font-light">Введите пароль</label>
          <Password
            v-model="password"
            id="password"
            class="w-full p-password p-component p-inputwrapper p-input-icon-right"
            input-class="w-full"
            toggleMask
            :feedback="false"
            @keyup.enter="authorize"
          />
        </div>
        <!--        <router-link to="/forgot-password" class="no-underline font-light text-sm text-primary">-->
        <!--          <p>Құпиясөзді ұмыттыңыз ба?</p>-->
        <!--        </router-link>-->
        <Message v-if="error" severity="error" class="mb-0" :closable="false">{{ error }}</Message>
        <Button label="Войти" class="w-full mt-3" :disabled="!iin" :loading="is_loading" @click="authorize" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login {
  background: #fff;
  box-shadow: 0 4px 35px rgba(0, 0, 0, 0.08);
  border-radius: 30px;
}

</style>
