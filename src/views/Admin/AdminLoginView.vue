<script setup lang="ts">
import { useRouter } from "vue-router"
import { ref } from "vue"
import { useUserStore } from "@/stores/user"
import type { AxiosError } from "axios"
import Message from "primevue/message"

const router = useRouter()
const { LOGIN_USER } = useUserStore()
// const { layout, SET_LAYOUT } = useSettings()
// const { SET_USER, SET_TOKEN } = useSession()

const isLoading = ref(false)
const email = ref("")
const password = ref("")
const error = ref("")

const authorize = async() => {
  isLoading.value = true
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
  //   isLoading.value = false
  // }

  try {
    await LOGIN_USER({
      email: email.value,
      password: password.value
    })
    await router.push({ name: 'AdminStudents' })
  } catch(err) {
    const errors = err as AxiosError
    error.value = errors.response.data?.['detail'] || "Ошибка!"
    throw err
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-column justify-content-center h-screen">
    <div class="flex justify-content-center flex-grow-1">
      <div class="login px-5 pt-3 pb-5 my-auto">
        <p class="text-lg font-semibold mb-6">Добро пожаловать на платформу Vanres</p>
        <div class="flex flex-column gap-2 mb-4">
          <label for="email" class="font-light">Введите Email</label>
          <InputText v-model="email" id="email" placeholder="Email" />
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
        <Button label="Войти" severity="secondary" class="w-full mt-3" :disabled="!email" :loading="isLoading" @click="authorize" />
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
