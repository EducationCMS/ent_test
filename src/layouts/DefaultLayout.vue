<script setup lang="ts">
import { useRouter } from "vue-router"
import { computed, defineAsyncComponent, onMounted } from "vue"
import { useUserStore } from "@/stores/user"
import { storeToRefs } from "pinia"

const ADMIN_MENU_ITEMS = [
  { label: 'Пробные ученики', icon: defineAsyncComponent(() => import(`@/assets/images/icons/sidebar/add_user.svg`)), routeName: 'AdminStudents' },
  { label: 'Результаты проб', icon: defineAsyncComponent(() => import(`@/assets/images/icons/sidebar/analytics.svg`)), routeName: 'AdminStudentResults' },
  { label: 'Школы', icon: defineAsyncComponent(() => import(`@/assets/images/icons/sidebar/graduation_cap.svg`)), routeName: 'AdminSchools' },
  { label: 'Классы', icon: defineAsyncComponent(() => import(`@/assets/images/icons/sidebar/briefcase.svg`)), routeName: 'AdminClasses' },
  { label: 'Матрица ЕНТ', icon: defineAsyncComponent(() => import(`@/assets/images/icons/sidebar/sitemap.svg`)), routeName: 'AdminMatrix' },
  { label: 'Матрица ОУСО', icon: defineAsyncComponent(() => import(`@/assets/images/icons/sidebar/sitemap.svg`)), routeName: 'AdminSchoolMatrix' },
]

const router = useRouter()
const current_router_name = computed(() => router.currentRoute.value.name)
const userStore = useUserStore()
const { LOGOUT_USER, GET_USER } = userStore

const { user } = storeToRefs(userStore)

const logout = () => {
  LOGOUT_USER()
  router.push({ name: "Home" })
}

onMounted(() => {
  const token = window.sessionStorage.getItem('@access-token')
  if(token) GET_USER()
  // if(token) getCurrentUser(token)
})
</script>

<template>
  <div class="relative">
    <div class="layout__sidebar flex flex-column">
      <h1
          class="layout__sidebar__logo cursor-pointer align-self-center mb-4"
          @click="router.push({ name: 'Home' })"
      >
        Vanres
      </h1>
      <div
          v-for="(item, index) in ADMIN_MENU_ITEMS"
          :key="item.icon"
          class="flex align-items-center cursor-pointer px-4 py-3 layout__sidebar__menu-item"
          :class="[current_router_name === item.routeName && 'is-active']"
          @click="router.push({ name: item.routeName })"
      >
        <div class="layout__sidebar__menu-item__icon mr-2">
          <component :is="item.icon" />
          <!--          <component :is="getIcon(item.icon)" />-->
          <!--          <img :src="`/src/assets/images/icons/sidebar/${item.icon}.svg`" :alt="item.label"/>-->
        </div>
        <span>{{ item.label }}</span>
      </div>
    </div>
    <div>
      <header class="layout__header flex justify-content-end align-items-center">
        <div class="flex align-items-center gap-4">
          <!--          <i class="pi pi-bell text-xl"></i>-->
          <div v-if="user" class="flex align-items-center cursor-pointer" @click="logout">
            <Avatar :label="user.firstName[0].toUpperCase()" class="mr-2" size="large" shape="circle" />
            <div>
              <p class="my-0 font-semibold">{{ user.firstName }} {{ user.lastName }}</p>
              <p class="my-0 font-semibold text-gray-500">{{ user.email }}</p>
            </div>
          </div>
        </div>
      </header>
      <main class="layout__main px-6">
        <div class="w-full">
          <slot/>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  &__sidebar {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    height: 100vh;
    width: 250px;
    background-color: var(--surface-200);

    &__logo {
      width: 130px;
    }

    &__menu-item {
      color: #374957;
      font-size: 15px;
      font-weight: 500;
      position: relative;

      &:hover {
        background-color: var(--surface-300);
      }

      &__icon {
        width: 1.5rem;
        height: 1.5rem;
        display: grid;
        place-items: center;
        fill: #374957;
      }

      &.is-active {
        background-color: var(--surface-300);

        &::before {
          content: "";
          position: absolute;
          top: 8px;
          bottom: 8px;
          left: -5px;
          width: 10px;
          border-radius: 12px;
          background-color: #374957;
        }
      }
    }
  }

  &__header {
    position: absolute;
    top: 0;
    right: 0;
    left: 250px;
    height: 80px;
  }

  &__main {
    position: absolute;
    left: 250px;
    top: 90px;
    right: 0;
  }
}
</style>
