<template>
    <div>
        <h2>Расписание на {{ scheduleDate }}</h2>

        <!-- Тулбар для управления столбцами и добавления лекций -->
        <div class="uk-margin-bottom">
            <div class="uk-button-group">
                <button
                    class="uk-button uk-button-default"
                    @click="toggleColumnsDropdown"
                >
                    Показать/Скрыть столбцы
                    <span uk-icon="icon: chevron-down"></span>
                </button>
                <div uk-dropdown="mode: click" class="uk-dropdown">
                    <ul class="uk-nav uk-dropdown-nav">
                        <li v-for="(col, key) in columns" :key="key">
                            <label>
                                <input
                                    type="checkbox"
                                    class="uk-checkbox"
                                    v-model="columns[key].visible"
                                />
                                {{ col.label }}
                            </label>
                        </li>
                    </ul>
                </div>
                <button class="uk-button uk-button-primary" @click="addLecture">
                    <span
                        uk-icon="icon: plus"
                        class="uk-margin-small-right"
                    ></span>
                    Добавить лекцию
                </button>
            </div>
        </div>

        <!-- Таблица -->
        <div class="uk-overflow-auto">
            <table
                class="uk-table uk-table-striped uk-table-hover uk-table-small"
            >
                <thead>
                    <tr>
                        <th
                            v-for="(col, key) in visibleColumns"
                            :key="key"
                            class="uk-text-nowrap"
                        >
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(item, index) in tableData"
                        :key="item.id"
                        class="uk-text-nowrap"
                    >
                        <td
                            v-for="(col, key) in visibleColumns"
                            :key="key"
                            @click="
                                key !== 'actions' && startEditing(index, key)
                            "
                        >
                            <!-- Для start_time, end_time, abnormal_time - input type="time" -->
                            <template
                                v-if="
                                    [
                                        'start_time',
                                        'end_time',
                                        'abnormal_time',
                                    ].includes(key) &&
                                    editingCell.row === index &&
                                    editingCell.col === key
                                "
                            >
                                <input
                                    :value="toTimeInput(tableData[index][key])"
                                    type="time"
                                    class="uk-input uk-form-small"
                                    @blur="saveTime(index, key, $event)"
                                    ref="timeInput"
                                    autofocus
                                />
                            </template>

                            <!-- Для corps - выпадающий список -->
                            <template
                                v-else-if="
                                    key === 'corps' &&
                                    editingCell.row === index &&
                                    editingCell.col === key
                                "
                            >
                                <select
                                    v-model="tableData[index][key]"
                                    @change="saveCorps(index)"
                                    @blur="stopEditing"
                                    class="uk-select uk-form-small"
                                    ref="corpsSelect"
                                    autofocus
                                >
                                    <option value="A">1</option>
                                    <option value="B">2</option>
                                </select>
                            </template>

                            <!-- Для действий - кнопка удаления -->
                            <template v-else-if="key === 'actions'">
                                <button
                                    class="uk-button uk-button-danger uk-button-small"
                                    @click="confirmDelete(index)"
                                >
                                    <span uk-icon="icon: trash"></span>
                                </button>
                            </template>

                            <!-- Для остальных редактируемых полей - contenteditable -->
                            <template
                                v-else-if="
                                    editingCell.row === index &&
                                    editingCell.col === key
                                "
                            >
                                <div
                                    contenteditable="true"
                                    @blur="saveEdit(index, key, $event)"
                                    @keydown.enter.prevent="
                                        saveEdit(index, key, $event)
                                    "
                                    class="editable-cell"
                                    ref="editable"
                                >
                                    {{ displayValue(item, key) }}
                                </div>
                            </template>

                            <!-- Обычное отображение -->
                            <template v-else>
                                {{ displayValue(item, key) || "-" }}
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Модальное окно с предупреждением -->
        <ModalWrapper ref="modalRef" title="Внимание!">
            <div class="modal-content">
                <p>
                    Внимание! Вы уверены, что хотите удалить лекцию из
                    расписания?
                </p>
            </div>
            <button
                class="uk-button uk-button-primary custom-button"
                @click="deletedLecture(lecture)"
            >
                <span uk-icon=""></span> Удалить
            </button>
            <button class="uk-button custom-button" @click="closeModal()">
                <span uk-icon=""></span> Отмена
            </button>
        </ModalWrapper>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import {
    getDay,
    updateLecture,
    createLecture,
    deleteLecture,
} from "../api/api";
import ModalWrapper from "./ModalWrapper.vue";

const route = useRoute();

// Состояние модального окна
const modalRef = ref(null);

// Открытие и закрытие модального окна
const openModal = () => modalRef.value.openModal();
const closeModal = () => modalRef.value.closeModal();

// Определение столбцов с возможностью скрытия
const columns = ref({
    id: { label: "ID", visible: true },
    start_time: { label: "Начало", visible: true },
    end_time: { label: "Конец", visible: true },
    abnormal_time: { label: "Не по расписанию", visible: true },
    platform: { label: "Платформа", visible: true },
    corps: { label: "Корпус", visible: true },
    location: { label: "Место", visible: true },
    groups: { label: "Группы", visible: true },
    lectors: { label: "Лекторы", visible: true },
    url: { label: "URL", visible: true },
    short_url: { label: "Короткая ссылка", visible: true },
    stream_key: { label: "Ключ потока", visible: true },
    account: { label: "Аккаунт", visible: true },
    commentary: { label: "Комментарий", visible: true },
    actions: { label: "Действия", visible: true },
});

// Фильтр видимых столбцов
const visibleColumns = computed(() => {
    return Object.fromEntries(
        Object.entries(columns.value).filter(([_, col]) => col.visible),
    );
});

const tableData = ref([]);
const scheduleDate = ref(route.params.date); // Оставляем как есть для отображения
const editingCell = ref({ row: null, col: null });
const lecture = ref({});

// Загрузка данных
const fetchLectures = async () => {
    const response = await getDay(route.params.date);
    tableData.value = response.data; // Храним в ISO формате
    if (response.data.length > 0) {
        // Отображаем дату в формате YYYY.MM.DD, но храним оригинал для API
        scheduleDate.value = response.data[0].date.replace(/-/g, ".");
    }
};

// Форматирование значений для отображения
const displayValue = (item, key) => {
    if (["start_time", "end_time", "abnormal_time"].includes(key)) {
        if (!item[key]) return "-";
        const date = new Date(item[key]);
        return isNaN(date.getTime())
            ? item[key]
            : date.toISOString().substring(11, 16); // HH:MM
    }
    if (key === "corps") {
        return item[key] === "A" ? "1" : item[key] === "B" ? "2" : item[key];
    }
    return item[key];
};

// Преобразование ISO в HH:MM для <input type="time">
const toTimeInput = (isoTime) => {
    if (!isoTime) return "";
    const date = new Date(isoTime);
    return isNaN(date.getTime()) ? "" : date.toISOString().substring(11, 16); // HH:MM
};

// Преобразование времени в ISO формат для отправки на сервер
const toISOFormat = (time, date) => {
    if (!time || !date) return null; // Сервер может ожидать null вместо пустой строки
    const isoDate = date.replace(/\./g, "-"); // Преобразуем обратно в YYYY-MM-DD
    return `${isoDate}T${time}:00.000Z`; // Формат: "2025-03-25T10:00:00.000Z"
};

// Добавление новой лекции
const addLecture = async () => {
    const isoDate = scheduleDate.value.replace(/\./g, "-"); // Преобразуем в YYYY-MM-DD
    const newLecture = {
        date: isoDate,
        start_time: toISOFormat("10:00", isoDate),
        end_time: toISOFormat("12:00", isoDate),
        abnormal_time: null, // Устанавливаем null для пустых полей времени
        platform: "",
        corps: "A",
        location: "",
        groups: "",
        lectors: "",
        url: "",
        short_url: "",
        stream_key: "",
        account: "",
        commentary: "",
    };

    console.log("Sending new lecture:", newLecture); // Логирование для отладки
    const result = await createLecture(newLecture);
    if (result.success) {
        tableData.value.push(result.data);
    } else {
        console.error("Ошибка создания лекции:", result.message);
        UIkit.notification({
            message: `Ошибка: ${result.message}`,
            status: "danger",
        });
    }
};

// Начало редактирования
const startEditing = (row, col) => {
    editingCell.value = { row, col };
    nextTick(() => {
        if (["start_time", "end_time", "abnormal_time"].includes(col)) {
            const timeInput = document.querySelector('[ref="timeInput"]');
            if (timeInput) timeInput.focus();
        } else if (col === "corps") {
            const select = document.querySelector('[ref="corpsSelect"]');
            if (select) select.focus();
        } else {
            const editable = document.querySelector(".editable-cell");
            if (editable) {
                editable.focus();
                document.execCommand("selectAll", false, null);
            }
        }
    });
};

// Сохранение изменений для обычных полей
const saveEdit = async (row, col, event) => {
    tableData.value[row][col] = event.target.innerText || ""; // Пустая строка вместо undefined
    await updateRow(row);
    stopEditing();
};

// Сохранение времени
const saveTime = async (row, col, event) => {
    const timeInput = event.target.value;
    tableData.value[row][col] = timeInput
        ? toISOFormat(timeInput, scheduleDate.value)
        : null; // null для пустого времени
    await updateRow(row);
    stopEditing();
};

// Сохранение корпуса
const saveCorps = async (row) => {
    await updateRow(row);
    stopEditing();
};

// Подтверждение удаления
const confirmDelete = (row) => {
    lecture.value = tableData.value[row];
    openModal();
};

// Удаление лекции
const deletedLecture = async (data) => {
    console.log("Deleting lecture:", data.id); // Логирование для отладки
    const result = await deleteLecture(data.id);
    if (result.success) {
        const index = tableData.value.findIndex((item) => item.id === data.id);
        if (index !== -1) {
            tableData.value.splice(index, 1);
        }
        closeModal();
    } else {
        console.error("Ошибка удаления:", result.message);
        UIkit.notification({
            message: `Ошибка: ${result.message}`,
            status: "danger",
        });
    }
};

// Отправка обновлений на сервер
const updateRow = async (row) => {
    const updatedData = { ...tableData.value[row] };
    console.log("Updating row:", updatedData); // Логирование для отладки
    const result = await updateLecture(updatedData.id, updatedData);
    if (!result.success) {
        console.error("Ошибка обновления:", result.message);
        UIkit.notification({
            message: `Ошибка: ${result.message}`,
            status: "danger",
        });
    }
};

// Остановка редактирования
const stopEditing = () => {
    editingCell.value = { row: null, col: null };
};

// Переключение видимости дропдауна
const toggleColumnsDropdown = () => {
    UIkit.dropdown(".uk-dropdown").toggle();
};

onMounted(() => {
    fetchLectures();
});
</script>

<style scoped>
.uk-table {
    width: 100%;
}

.editable-cell {
    padding: 5px;
    min-width: 100px;
    outline: none;
    border: 1px dashed #ccc;
    background: #fff;
}

.editable-cell:focus {
    border: 1px solid #1e87f0;
}

.uk-table td {
    cursor: pointer;
}

.uk-input.uk-form-small,
.uk-select.uk-form-small {
    padding: 2px;
    height: auto;
    font-size: 0.875rem;
}

.custom-button {
    margin-right: 10px;
}
</style>
