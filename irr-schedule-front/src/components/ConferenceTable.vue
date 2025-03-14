<template>
  <div>
    <!-- Тулбар для управления столбцами -->
    <div class="uk-margin-bottom">
      <div class="uk-button-group">
        <button class="uk-button uk-button-default" @click="toggleColumnsDropdown">
          Показать/Скрыть столбцы <span uk-icon="icon: chevron-down"></span>
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
      </div>
    </div>

    <!-- Таблица -->
    <div class="uk-overflow-auto">
      <table class="uk-table uk-table-striped uk-table-hover uk-table-small">
        <thead>
          <tr>
            <th v-for="(col, key) in visibleColumns" :key="key" class="uk-text-nowrap">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in tableData" :key="index">
            <td
              v-for="(col, key) in visibleColumns"
              :key="key"
              @click="startEditing(index, key)"
              class="uk-text-nowrap"
            >
              <!-- Для статуса - выпадающий список -->
              <template v-if="key === 'status' && editingCell.row === index && editingCell.col === key">
                <select
                  v-model="tableData[index][key]"
                  @change="saveStatus(index)"
                  @blur="stopEditing"
                  class="uk-select uk-form-small"
                  ref="statusSelect"
                  autofocus
                >
                  <option value="Новая">Новая</option>
                  <option value="Запланировано">Запланировано</option>
                  <option value="Активно">Активно</option>
                  <option value="Завершено">Завершено</option>
                  <option value="Отменено">Отменено</option>
                </select>
              </template>

              <!-- Для "Начало" - отдельные поля редактирования -->
              <template v-else-if="key === 'start' && editingCell.row === index && editingCell.col === key">
                <div class="uk-grid-small uk-child-width-1-2" uk-grid>
                  <div>
                    <input
                      v-model="tableData[index].start_date"
                      type="date"
                      class="uk-input uk-form-small"
                      @blur="saveDateTime(index, 'start')"
                      ref="startDateInput"
                      autofocus
                    />
                  </div>
                  <div>
                    <input
                      v-model="tableData[index].start_time"
                      type="time"
                      class="uk-input uk-form-small"
                      @blur="saveDateTime(index, 'start')"
                    />
                  </div>
                </div>
              </template>

              <!-- Для "Конец" - отдельные поля редактирования -->
              <template v-else-if="key === 'end' && editingCell.row === index && editingCell.col === key">
                <div class="uk-grid-small uk-child-width-1-2" uk-grid>
                  <div>
                    <input
                      v-model="tableData[index].end_date"
                      type="date"
                      class="uk-input uk-form-small"
                      @blur="saveDateTime(index, 'end')"
                      ref="endDateInput"
                      autofocus
                    />
                  </div>
                  <div>
                    <input
                      v-model="tableData[index].end_time"
                      type="time"
                      class="uk-input uk-form-small"
                      @blur="saveDateTime(index, 'end')"
                    />
                  </div>
                </div>
              </template>

              <!-- Для остальных полей - редактируемый текст -->
              <template v-else-if="editingCell.row === index && editingCell.col === key">
                <div
                  contenteditable="true"
                  @blur="saveEdit(index, key, $event)"
                  @keydown.enter.prevent="saveEdit(index, key, $event)"
                  class="editable-cell"
                  ref="editable"
                >
                  {{ item[key] }}
                </div>
              </template>

              <!-- Обычное отображение -->
              <template v-else>
                {{ getDisplayValue(item, key) || '-' }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { getConfs, updateConf } from '../api/api'; // Импорт функций

// Определение столбцов
const columns = ref({
  id: { label: 'ID', visible: true },
  event_name: { label: 'Мероприятие', visible: true },
  full_name: { label: 'ФИО', visible: true },
  email: { label: 'Почта', visible: true },
  phone: { label: 'Телефон', visible: true },
  start: { label: 'Начало', visible: true },
  end: { label: 'Конец', visible: true },
  location: { label: 'Место', visible: true },
  platform: { label: 'Платформа', visible: true },
  status: { label: 'Статус', visible: true },
  url: { label: 'URL', visible: true },
  short_url: { label: 'Short URL', visible: true },
  user: { label: 'Админ', visible: true },
  commentary: { label: 'Комментарий', visible: true },
});

// Фильтр видимых столбцов
const visibleColumns = computed(() => {
  return Object.fromEntries(
    Object.entries(columns.value).filter(([_, col]) => col.visible)
  );
});

// Данные таблицы
const tableData = ref([]);

// Состояние редактирования
const editingCell = ref({ row: null, col: null });

// Загрузка данных при монтировании
onMounted(async () => {
  const result = await getConfs();
  if (result.success) {
    tableData.value = result.data;
  } else {
    console.error('Ошибка загрузки конференций:', result.message);
    UIkit.notification({
      message: `Ошибка: ${result.message}`,
      status: 'danger',
    });
  }
});

// Форматирование значений для отображения
const getDisplayValue = (item, key) => {
  if (key === 'start') {
    return item.start_date && item.start_time
      ? `${item.start_date} ${item.start_time}`
      : '-';
  }
  if (key === 'end') {
    return item.end_date && item.end_time
      ? `${item.end_date} ${item.end_time}`
      : '-';
  }
  return item[key];
};

// Начало редактирования
const startEditing = (row, col) => {
  editingCell.value = { row, col };
  nextTick(() => {
    if (col === 'status') {
      const select = document.querySelector('select');
      if (select) select.focus();
    } else if (col === 'start' || col === 'end') {
      const dateInput = col === 'start' ? document.querySelector('[ref="startDateInput"]') : document.querySelector('[ref="endDateInput"]');
      if (dateInput) dateInput.focus();
    } else {
      const editable = document.querySelector('.editable-cell');
      if (editable) {
        editable.focus();
        document.execCommand('selectAll', false, null);
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

// Сохранение статуса
const saveStatus = async (row) => {
  await updateRow(row);
  stopEditing();
};

// Сохранение даты и времени
const saveDateTime = async (row, col) => {
  await updateRow(row);
  stopEditing();
};

// Отправка обновлённых данных на сервер
const updateRow = async (row) => {
  const updatedData = { ...tableData.value[row] };
  const result = await updateConf(updatedData.id, updatedData);
  if (!result.success) {
    console.error('Ошибка обновления:', result.message);
    UIkit.notification({
      message: `Ошибка: ${result.message}`,
      status: 'danger',
    });
  }
};

// Остановка редактирования
const stopEditing = () => {
  editingCell.value = { row: null, col: null };
};

// Переключение видимости дропдауна
const toggleColumnsDropdown = () => {
  UIkit.dropdown('.uk-dropdown').toggle();
};
</script>

<style scoped>
/* Скрываем стандартный вид contenteditable */
.editable-cell {
  padding: 5px;
  min-width: 50px;
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

.uk-select.uk-form-small,
.uk-input.uk-form-small {
  padding: 2px;
  height: auto;
  font-size: 0.875rem;
}
</style>