<template>
    <div class="uk-flex uk-flex-center uk-flex-middle uk-height-viewport">
        <div class="uk-card uk-card-default uk-card-body uk-width-1-3@m">
            <h3 class="uk-card-title">Вход</h3>
            <form @submit.prevent="handleLogin">
                <div class="uk-margin">
                    <label class="uk-form-label" for="username"
                        >Имя пользователя</label
                    >
                    <input
                        v-model="username"
                        class="uk-input"
                        id="username"
                        type="text"
                        placeholder="Имя пользователя"
                        required
                    />
                </div>
                <div class="uk-margin">
                    <label class="uk-form-label" for="password">Пароль</label>
                    <input
                        v-model="password"
                        class="uk-input"
                        id="password"
                        type="password"
                        placeholder="Пароль"
                        required
                    />
                </div>
                <div v-if="errorMessage" class="uk-alert-danger" uk-alert>
                    {{ errorMessage }}
                </div>
                <div class="uk-margin">
                    <button
                        class="uk-button uk-button-primary uk-width-1-1"
                        type="submit"
                    >
                        Войти
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "../api/api";

const username = ref("");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();

const handleLogin = async () => {
    errorMessage.value = "";
    const result = await login(username.value, password.value);

    if (result.success) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("role", result.data.role);
        router.push("/conferences");
    } else {
        return result.status === 401
            ? (errorMessage.value = "Неверные учетные данные")
            : (errorMessage.value = "Ошибка сервера, попробуйте позже");
    }
};
</script>
