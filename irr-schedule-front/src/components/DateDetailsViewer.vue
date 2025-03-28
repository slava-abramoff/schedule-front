<template>
    <div>
        <h2>Расписание на {{ scheduleDate }}</h2>

        <div class="uk-margin-bottom">
            <button class="uk-button uk-button-primary" @click="addLecture">
                <span uk-icon="icon: plus" class="uk-margin-small-right"></span>
                Добавить лекцию
            </button>
        </div>

        <div class="uk-overflow-auto">
            <table
                class="uk-table uk-table-striped uk-table-hover uk-table-small"
            >
                <thead>
                    <tr>
                        <th
                            v-for="(col, key) in columns"
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
                            v-for="(col, key) in columns"
                            :key="key"
                            @click="
                                key !== 'actions' && startEditing(index, key)
                            "
                        >
                            <!-- Для start_time - input type="time" -->
                            <template
                                v-if="
                                    key === 'start_time' &&
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

                            <!-- Для end_time - input type="time" -->
                            <template
                                v-else-if="
                                    key === 'end_time' &&
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

                            <!-- Для остальных редактируемых полей - contenteditable -->
                            <template
                                v-else-if="
                                    key !== 'actions' &&
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

                            <!-- Для действий - кнопка удаления -->
                            <template v-else-if="key === 'actions'">
                                <button
                                    class="uk-button uk-button-danger uk-button-small"
                                    @click="confirmDelete(index)"
                                >
                                    <span uk-icon="icon: trash"></span>
                                </button>
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
import { ref, onMounted, nextTick } from "vue";
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

// Открытие модального окна
const openModal = () => {
    modalRef.value.openModal();
};

// Закрытие модального окнас
const closeModal = () => {
    modalRef.value.closeModal();
};

// Определение столбцов
const columns = ref({
    start_time: { label: "Начало" },
    end_time: { label: "Конец" },
    abnormal_time: { label: "Не по расписанию" },
    platform: { label: "Платформа" },
    corps: { label: "Корпус" },
    location: { label: "Место" },
    groups: { label: "Группы" },
    lectors: { label: "Лекторы" },
    commentary: { label: "Комментарий" },
    actions: { label: "Действия" },
});

const tableData = ref([]);
const scheduleDate = ref(route.params.date);
const editingCell = ref({ row: null, col: null });
const rowToDelete = ref({});

// Загрузка данных
const fetchLectures = async () => {
    const response = await getDay(route.params.date);
    tableData.value = response.data; // Храним в ISO формате
    if (response.data.length > 0) {
        scheduleDate.value = response.data[0].date;
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

// Преобразование времени в ISO формат для хранения
const toISOFormat = (time, date) => {
    if (!time || !date) return "";
    const combined = `${date}T${time}:00Z`;
    const isoDate = new Date(combined);
    return isoDate.toISOString(); // "2025-06-21T12:00:00Z"
};

// Добавление новой лекции
const addLecture = async () => {
    const newLecture = {
        date: scheduleDate.value,
        start_time: toISOFormat("00:00", scheduleDate.value), // "YYYY-MM-DDTHH:MM:00Z"
        end_time: toISOFormat("00:00", scheduleDate.value),
        platform: "",
        corps: "A",
        location: "",
        groups: "",
        lectors: "",
        commentary: "",
    };

    const result = await createLecture(newLecture);
    if (result.success) {
        tableData.value.push(result.data); // Добавляем новую строку в таблицу
    } else {
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
        if (col === "start_time" || col === "end_time") {
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
    tableData.value[row][col] = event.target.innerText;
    await updateRow(row);
    stopEditing();
};

// Сохранение времени
const saveTime = async (row, col, event) => {
    const timeInput = event.target.value;
    if (timeInput) {
        tableData.value[row][col] = toISOFormat(timeInput, scheduleDate.value); // Сохраняем в ISO
    } else {
        tableData.value[row][col] = ""; // Если пусто, сохраняем пустую строку
    }
    await updateRow(row);
    stopEditing();
};

// Сохранение корпуса
const saveCorps = async (row) => {
    await updateRow(row);
    stopEditing();
};

const lecture = ref({});

const confirmDelete = async (row) => {
    lecture.value = tableData.value[row];
    openModal();
};

// Удаление лекции
const deletedLecture = async (data) => {
    await deleteLecture(data.id);

    const index = tableData.value.findIndex(
        (item) => item.id === lecture.value.id,
    );
    if (index !== -1) {
        tableData.value.splice(index, 1);
    }

    closeModal();
};

// Отправка обновлений на сервер
const updateRow = async (row) => {
    const updatedData = { ...tableData.value[row] }; // Уже в ISO формате
    const result = await updateLecture(updatedData.id, updatedData);
    if (!result.success) {
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
</style>
