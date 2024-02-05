import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("../views/LoginView.vue")
    },
    {
      path: "/test",
      name: "TestStart",
      component: () => import("../views/TestStartView.vue")
    },
    {
      path: "/test/:id",
      name: "Test",
      component: () => import("../views/TestView.vue")
    },
    {
      path: "/admin",
      name: "Admin",
      component: () => import("../views/Admin/AdminLoginView.vue"),
    },
    {
      path: '/admin/students',
      name: 'AdminStudents',
      component: () => import("../views/Admin/AdminStudents.vue"),
      meta: {
        sidebar: true
      }
    },
    {
      path: '/admin/student-results',
      name: 'AdminStudentResults',
      component: () => import("../views/Admin/AdminStudentsResults.vue"),
      meta: {
        sidebar: true
      }
    },
    {
      path: '/admin/schools',
      name: 'AdminSchools',
      component: () => import("../views/Admin/AdminSchools.vue"),
      meta: {
        sidebar: true
      }
    },
    {
      path: '/admin/classes',
      name: 'AdminClasses',
      component: () => import("../views/Admin/AdminClasses.vue"),
      meta: {
        sidebar: true
      }
    },
    {
      path: '/admin/matrix',
      name: 'AdminMatrix',
      component: () => import("../views/Admin/AdminMatrix.vue"),
      meta: {
        sidebar: true
      }
    },
    {
      path: '/admin/school-matrix',
      name: 'AdminSchoolMatrix',
      component: () => import("../views/Admin/AdminSchoolMatrix.vue"),
      meta: {
        sidebar: true
      }
    },
  ]
})

export default router
