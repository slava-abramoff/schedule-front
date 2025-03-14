<template>
    <div>
        <!-- Модальное окно -->
        <div ref="modal" uk-modal>
            <div class="uk-modal-dialog uk-modal-body">
                <h2 class="uk-modal-title">{{ title }}</h2>
                <slot></slot> <!-- Слот для контента модального окна -->
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import UIkit from 'uikit';

export default {
    props: {
        title: {
            type: String,
            default: 'Модальное окно',
        },
    },
    setup() {
        const modal = ref(null);

        // Метод для открытия модального окна
        const openModal = () => {
            UIkit.modal(modal.value).show();
        };

        // Метод для закрытия модального окна
        const closeModal = () => {
            UIkit.modal(modal.value).hide();
        };

        // Возвращаем методы, чтобы их можно было использовать снаружи
        return {
            modal,
            openModal,
            closeModal,
        };
    },
};
</script>

<style scoped>
/* Добавьте свои стили, если необходимо */
</style>