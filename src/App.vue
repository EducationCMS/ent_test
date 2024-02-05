<script lang="ts" setup>
import { defineAsyncComponent, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useUserStore } from "@/stores/user"

const EmptyLayout = defineAsyncComponent(() => import("@/layouts/EmptyLayout.vue"))
const DefaultLayout = defineAsyncComponent(() => import("@/layouts/DefaultLayout.vue"))

const route = useRoute()

// const { SET_USER, SET_TOKEN } = useSession()
//
// const getCurrentUser = async(token: string) => {
//   try {
//     const { data } = await http.get('me')
//     await SET_USER(data)
//     await SET_TOKEN(token)
//   } catch(err) {
//     console.error(err)
//     throw err
//   }
// }
</script>

<template>
  <Suspense timeout="0">
    <component :is="route.meta.sidebar ? DefaultLayout : EmptyLayout">
      <Toast />
      <RouterView />
    </component>
    <template #fallback>
      <div style="color: #a8abb2; font-weight: 300; text-align: center">
        <span>загрузка...</span>
      </div>
    </template>
  </Suspense>
</template>
