import { createRouter, createWebHistory } from 'vue-router';

// Определение маршрутов
const routes = [
  {
    path: '/login',
    component: () => import('../pages/AuthPage.vue'),
    meta: { title: 'Вход' }
  },
  {
    path: '/conferences',
    component: () => import('../pages/ConferencePage.vue'),
    meta: { title: 'ВКС' }
  },
  {
    path: '/lectures',
    component: () => import('../pages/LecturePage.vue'),
    meta: { title: 'Лекции' }
  },
  {
    path: '/lectures/:date',
    component: () => import('../pages/LectureDay.vue'),
    meta: { title: 'Расписание лекций' }
  },
  {
    path: '/connecting/:date',
    component: () => import('../pages/ConnectingDay.vue'),
    meta: { title: 'Расписание трансляций' }
  },
  {
    path: '/users',
    component: () => import('../pages/UsersPage.vue'),
    meta: { title: 'Пользователи', requiresAdmin: true } // Требуется роль admin
  },
  {
    path: '/',
    component: () => import('../pages/FormPage.vue'),
    meta: { title: 'Заявки на ВКС' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Навигационный guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Установка заголовка страницы
  document.title = to.meta.title || 'Моё приложение';

  // Если пользователь не авторизован (нет token)
  if (!token) {
    if (to.path === '/' || to.path === '/login') {
      next(); // Разрешаем доступ к "/" и "/login"
    } else {
      next('/login'); // Перенаправляем на логин
    }
    return;
  }

  // Если пользователь авторизован (есть token)
  if (to.path === '/login') {
    next('/'); // Перенаправляем на главную, если пытается зайти на логин
    return;
  }

  // Проверка роли для страницы /users
  if (to.meta.requiresAdmin && role !== 'admin') {
    next('/'); // Перенаправляем на главную, если не admin
    return;
  }

  // Разрешаем доступ ко всем остальным маршрутам для авторизованного пользователя
  next();
});

export default router;