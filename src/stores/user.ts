import { acceptHMRUpdate, defineStore } from "pinia"
import http from "@/plugins/axios"
// @ts-ignore
import type { ICourse } from "@/views/Admin/Course/CourseListView"
// @ts-ignore
import type { IGroup } from "@/views/Admin/Group/GroupDetailView"
// import type { ICourse } from "@/views/Admin/Course/CourseListView.vue"
// import type { IGroup } from "@/views/Admin/Group/GroupDetailView"

export const EMPTY_LAYOUT = "empty-layout"
export const DEFAULT_LAYOUT = "default-layout"


export interface IRegion {
  id?: number,
  name: string
}

export interface ICity {
  id?: number,
  name: string,
  region?: IRegion
}

export interface ISchool {
  id?: number,
  name: string,
  city: ICity
}
export interface IUser {
  id: number,
  age: number,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  login: string,
  middleName: string,
  appRole: IRole,
  avatar: string,
  subjects: ICourse[],
  city: ICity,
  school: ISchool,
  region: IRegion,
  iin: string,
  subgroups?: IGroup[],
  permissionForTest: boolean
}

export interface IRole {
  id: number,
  name: string
}

interface ILoginPayload {
  email: string,
  password: string
}

interface ILoginStudentPayload {
  iin: string,
  password: string
}

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: null as IUser|null,
      layout: EMPTY_LAYOUT as string,
    }
  },
  actions: {
    async GET_USER() {
      try {
        const { data } = await http.get('api/me')
        this.user = data
      } catch(e) {
        console.error(e)
        throw e
      }
    },
    async GET_STUDENT() {
      try {
        const { data } = await http.get('api/user-get-me')
        this.user = data
      } catch(e) {
        console.error(e)
        throw e
      }
    },
    async LOGIN_USER(payload: ILoginPayload) {
      const { email, password } = payload
      try {
        const { data } = await http.post("api/login", { email, password })
        if(data?.accessToken && data?.refreshToken) {
          this.user = data?.user
          this.layout = DEFAULT_LAYOUT
          window.sessionStorage.setItem("@access-token", data?.accessToken)
          window.sessionStorage.setItem("@refresh-token", data?.refreshToken)
        }
        return data?.user
      } catch(err) {
        console.error(err)
        throw err
      }
    },
    async LOGIN_STUDENT(payload: ILoginStudentPayload) {
      const { iin, password } = payload
      try {
        const { data } = await http.post("api/user-login", { iin, password })
        if(data?.accessToken) {
          this.user = data?.testUser
          this.layout = DEFAULT_LAYOUT
          window.sessionStorage.setItem("@access-token", data?.accessToken)
        }
        return data?.testUser
      } catch(err) {
        console.error(err)
        throw err
      }
    },
    LOGOUT_USER() {
      window.sessionStorage.removeItem('@access-token')
      window.sessionStorage.removeItem('@refresh-token')
      this.layout = EMPTY_LAYOUT
      this.user = null
    }
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
