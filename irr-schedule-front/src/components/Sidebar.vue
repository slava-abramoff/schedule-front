<template>
    <div class="uk-position-fixed sidebar">
        <div class="uk-background-muted uk-padding-small uk-height-1-1">
            <ul class="uk-nav uk-nav-default">
                <li class="uk-nav-header">Навигация</li>
                <li>
                    <router-link to="/conferences">
                        <span
                            uk-icon="icon: desktop"
                            class="uk-margin-small-right"
                        ></span>
                        Конференции
                    </router-link>
                </li>
                <li>
                    <router-link to="/lectures">
                        <span
                            uk-icon="icon: bookmark"
                            class="uk-margin-small-right"
                        ></span>
                        Лекции
                    </router-link>
                </li>
                <li v-if="role === 'admin'">
                    <router-link to="/users">
                        <span
                            uk-icon="icon: users"
                            class="uk-margin-small-right"
                        ></span>
                        Пользователи
                    </router-link>
                </li>
                <li>
                    <router-link to="/login" @click="logout">
                        <span
                            uk-icon="icon: sign-out"
                            class="uk-margin-small-right"
                        ></span>
                        Выход
                    </router-link>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import UIkit from "uikit";

const role = ref("");

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
};

onMounted(() => {
    role.value = localStorage.getItem("role");
    UIkit.icon(".uk-nav a");
});
</script>

<style scoped>
.sidebar {
    top: 0;
    left: 0;
    z-index: 10;
    height: 100vh;
    overflow-y: auto;
    width: 205px; /* Увеличиваем ширину сайдбара */
}

.uk-nav a {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    padding: 10px 0;
}

.uk-nav a [uk-icon] {
    width: 24px;
    height: 24px;
    margin-right: 12px;
}

.uk-nav-header {
    font-size: 1.3rem;
    padding: 10px 0;
}

.uk-nav a.router-link-active {
    color: #1e87f0;
    font-weight: bold;
}

.uk-nav a:hover {
    color: #1e87f0;
    text-decoration: none;
}
</style>
