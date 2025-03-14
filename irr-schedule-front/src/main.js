import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import 'uikit/dist/css/uikit.min.css'; // Импорт стилей UIkit
import UIkit from 'uikit'; // Импорт JS UIkit
import Icons from 'uikit/dist/js/uikit-icons'; // Опционально: иконки UIkit

// Подключение иконок (если нужны)
UIkit.use(Icons);

const app = createApp(App);
app.use(router); // Подключаем Vue Router
app.mount('#app');