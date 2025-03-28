<template>
    <div class="uk-flex uk-flex-center uk-flex-middle uk-height-viewport">
        <router-link
            to="/login"
            class="uk-button uk-button-default uk-position-top-right uk-margin-small-top uk-margin-small-right"
        >
            Войти
        </router-link>

        <div class="uk-card uk-card-default uk-card-body uk-width-1-2@m">
            <h3 class="uk-card-title">Создать конференцию</h3>
            <form @submit.prevent="handleCreateConf">
                <!-- Мероприятие -->
                <div class="uk-margin">
                    <label class="uk-form-label" for="event_name"
                        >Мероприятие</label
                    >
                    <input
                        v-model="data.event_name"
                        class="uk-input"
                        id="event_name"
                        type="text"
                        placeholder="ВКС Социально-психологическое тестирование"
                        required
                    />
                </div>

                <!-- ФИО -->
                <div class="uk-margin">
                    <label class="uk-form-label" for="full_name">ФИО</label>
                    <input
                        v-model="data.full_name"
                        class="uk-input"
                        id="full_name"
                        type="text"
                        placeholder="Иванов Иван Иваныч"
                        required
                    />
                </div>

                <!-- Почта -->
                <div class="uk-margin">
                    <label class="uk-form-label" for="email">Почта</label>
                    <input
                        v-model="data.email"
                        class="uk-input"
                        id="email"
                        type="email"
                        placeholder="IRR@example.com"
                        required
                    />
                </div>

                <!-- Телефон -->
                <div class="uk-margin">
                    <label class="uk-form-label" for="phone">Телефон</label>
                    <input
                        v-model="data.phone"
                        class="uk-input"
                        id="phone"
                        type="tel"
                        placeholder="+7 (999) 999-99-99"
                        required
                    />
                </div>

                <!-- Дата и время -->
                <div class="uk-margin">
                    <label class="uk-form-label">Дата и время</label>
                    <div class="uk-grid-small uk-child-width-1-2@s" uk-grid>
                        <div>
                            <label class="uk-form-label">Начало</label>
                            <input
                                v-model="data.start_date"
                                class="uk-input"
                                type="date"
                                required
                            />
                            <input
                                v-model="data.start_time"
                                class="uk-input uk-margin-small-top"
                                type="time"
                                required
                            />
                        </div>
                        <div>
                            <label class="uk-form-label">Конец</label>
                            <input
                                v-model="data.end_date"
                                class="uk-input"
                                type="date"
                            />
                            <input
                                v-model="data.end_time"
                                class="uk-input uk-margin-small-top"
                                type="time"
                            />
                        </div>
                    </div>
                </div>

                <!-- Место проведения -->
                <div class="uk-margin">
                    <label class="uk-form-label" for="location"
                        >Место проведения</label
                    >
                    <input
                        v-model="data.location"
                        class="uk-input"
                        id="location"
                        type="text"
                        placeholder="101"
                        required
                    />
                </div>

                <!-- Платформа -->
                <div class="uk-margin">
                    <label class="uk-form-label" for="platform"
                        >Платформа</label
                    >
                    <select
                        v-model="data.platform"
                        class="uk-select"
                        id="platform"
                        required
                    >
                        <option value="" disabled selected>
                            Выберите платформу
                        </option>
                        eor
                        <option value="sferum">СФЕРУМ</option>
                        <option value="vk">ВК трансляции</option>
                        <option value="other">Другое</option>
                    </select>
                </div>

                <!-- Оборудование -->
                <div class="uk-margin">
                    <label class="uk-form-label" for="devices"
                        >Оборудование</label
                    >
                    <select
                        v-model="data.devices"
                        class="uk-select"
                        id="devices"
                        required
                    >
                        <option value="" disabled selected>
                            Выберите оборудование
                        </option>
                        <option value="webcam">Вебкамера</option>
                        <option value="none">Не требуется</option>
                    </select>
                </div>

                <!-- Примечание -->
                <div class="uk-margin">
                    <label class="uk-form-label" for="commentary"
                        >Примечание</label
                    >
                    <input
                        v-model="data.commentary"
                        class="uk-input"
                        id="commentary"
                        type="text"
                        placeholder="Примечание"
                        required
                    />
                </div>

                <!-- Кнопка отправки -->
                <div class="uk-margin">
                    <button
                        class="uk-button uk-button-primary uk-width-1-1"
                        type="submit"
                    >
                        Отправить
                    </button>
                </div>
            </form>

            <!-- Модальное окно -->
            <ModalWrapper ref="modalRef" title="Успешно">
                <div class="modal-content">
                    <p>
                        <span uk-icon="check"></span> Конференция успешно
                        создана!
                    </p>
                </div>
            </ModalWrapper>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { createConf } from "../api/api"; // Предполагаем, что это ваша функция для API
import ModalWrapper from "../components/ModalWrapper.vue";

const modalRef = ref(null);

const data = ref({
    event_name: "",
    full_name: "",
    email: "",
    phone: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    location: "",
    platform: "",
    devices: "",
    commentary: "",
});

const openModal = () => {
    modalRef.value.openModal();
};

const closeModal = () => {
    modalRef.value.closeModal();
};

const handleCreateConf = async () => {
    try {
        const response = await createConf(data.value);
        if (response.success) {
            openModal();
            data.value = {
                event_name: "",
                full_name: "",
                email: "",
                phone: "",
                start_date: "",
                end_date: "",
                start_time: "",
                end_time: "",
                location: "",
                platform: "",
                devices: "",
                commentary: "",
            };
        }
    } catch (error) {
        console.error("Ошибка при создании конференции:", error);
        // Можно добавить обработку ошибки, например, показать сообщение
        UIkit.notification({
            message: `Ошибка: ${error.message || "Не удалось создать конференцию"}`,
            status: "danger",
        });
    }
};
</script>

<style scoped>
.uk-height-viewport {
    min-height: 100vh;
}
</style>
