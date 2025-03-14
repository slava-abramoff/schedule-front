<template>
  <div>
    <!-- Кнопка добавления пользователя -->
    <div class="uk-margin-bottom">
      <button class="uk-button uk-button-primary" @click="openModal">
        <span uk-icon="icon: plus" class="uk-margin-small-right"></span>
        Добавить пользователя
      </button>
    </div>

    <!-- Модальное окно создания пользователя -->
    <ModalWrapper ref="modalRef" title="Создание пользователя">

      <div class="uk-margin">
        <input class="uk-input" type="text" placeholder="Имя пользователя" v-model="user.username" />
      </div>

      <div class="uk-margin">
        <input class="uk-input" type="password" placeholder="Пароль" v-model="user.password" />
      </div>

      <div class="uk-margin">
        <select class="uk-select" v-model="user.role">
          <option>Выберите роль</option>
          <option value="admin">Администратор</option>
          <option value="moderator">Модератор</option>
          <option value="viewer">Зритель</option>
        </select>
      </div>

      <div class="uk-margin">
        <button class="uk-button uk-button-primary" @click="addUser">
          Создать
        </button>
        <button class="uk-button uk-button-default" @click="closeModal">
          Закрыть
        </button>
      </div>
    </ModalWrapper>



    <!-- Таблица -->
    <div class="uk-overflow-auto">
      <table class="uk-table uk-table-striped uk-table-hover uk-table-small">
        <thead>
          <tr>
            <th v-for="(col, key) in columns" :key="key" class="uk-text-nowrap">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in tableData" :key="index">
            <td v-for="(col, key) in columns" :key="key" @click="key !== 'actions' && startEditing(index, key)"
              class="uk-text-nowrap">
              <!-- Для роли - выпадающий список -->
              <template v-if="key === 'role' && editingCell.row === index && editingCell.col === key">
                <select v-model="tableData[index][key]" @change="saveRole(index)" @blur="stopEditing"
                  class="uk-select uk-form-small" ref="roleSelect" autofocus>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </template>

              <!-- Для остальных полей - редактируемый текст -->
              <template v-else-if="key !== 'actions' && editingCell.row === index && editingCell.col === key">
                <div contenteditable="true" @blur="saveEdit(index, key, $event)"
                  @keydown.enter.prevent="saveEdit(index, key, $event)" class="editable-cell" ref="editable">
                  {{ item[key] }}
                </div>
              </template>

              <!-- Для действий - кнопка удаления -->
              <template v-else-if="key === 'actions'">
                <button class="uk-button uk-button-danger uk-button-small" @click="deletingUser(index)">
                  <span uk-icon="icon: trash"></span>
                </button>
              </template>

              <!-- Обычное отображение -->
              <template v-else>
                {{ item[key] || '-' }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import ModalWrapper from './ModalWrapper.vue';
import { createUser, getUsers, deleteUser, updateUser } from '../api/api';

// Определение столбцов
const columns = ref({
  id: { label: 'ID' },
  username: { label: 'Имя' },
  password: { label: 'Пароль' },
  role: { label: 'Роль' },
  actions: { label: 'Действия' },
});

// Пользователь
const user = ref({
  username: '',
  password: '',
  role: '',
});

// Состояние модального окна
const modalRef = ref(null);

// Данные таблицы
const tableData = ref([]);

// Состояние редактирования
const editingCell = ref({ row: null, col: null });

// Открытие модального окна
const openModal = () => {
  modalRef.value.openModal();
}

// Закрытие модального окна
const closeModal = () => {
  modalRef.value.closeModal();
}

// Загрузка данных при монтировании
onMounted(async () => {
  const result = await getUsers();
  if (result.success) {
    tableData.value = result.data;
  } else {
    console.error('Ошибка загрузки пользователей:', result.message);
    UIkit.notification({
      message: `Ошибка: ${result.message}`,
      status: 'danger',
    });
  }
});

// Начало редактирования
const startEditing = (row, col) => {
  editingCell.value = { row, col };
  nextTick(() => {
    if (col === 'role') {
      const select = document.querySelector('select');
      if (select) select.focus();
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

// Сохранение роли
const saveRole = async (row) => {
  await updateRow(row);
  stopEditing();
};

// Добавление нового пользователя
const addUser = async () => {
  const result = await createUser(user.value);
  if (result.success) {
    tableData.value.push(result.data);
    closeModal();
    user.value = {
      username: '',
      password: '',
      role: '',
    }
  } else {
    console.error('Ошибка добавления:', result.message);
    UIkit.notification({
      message: `Ошибка: ${result.message}`,
      status: 'danger',
    });
  }
};

// Удаление пользователя
const deletingUser = async (row) => {
  const userId = tableData.value[row].id;
  if (userId) {
    const result = await deleteUser(userId);
    if (result.success) {
      tableData.value.splice(row, 1); // Удаляем строку из таблицы
    } else {
      console.error('Ошибка удаления:', result.message);
      UIkit.notification({
        message: `Ошибка: ${result.message}`,
        status: 'danger',
      });
    }
  } else {
    tableData.value.splice(row, 1); // Если ID нет (новый пользователь), просто удаляем локально
  }
};

// Отправка обновлённых данных на сервер
const updateRow = async (row) => {
  const updatedData = { ...tableData.value[row] };
  if (updatedData.id) { // Обновляем только существующих пользователей
    const result = await updateUser(updatedData.id, updatedData);
    if (!result.success) {
      console.error('Ошибка обновления:', result.message);
      UIkit.notification({
        message: `Ошибка: ${result.message}`,
        status: 'danger',
      });
    }
  }
};

// Остановка редактирования
const stopEditing = () => {
  editingCell.value = { row: null, col: null };
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

.uk-select.uk-form-small {
  padding: 2px;
  height: auto;
  font-size: 0.875rem;
}
</style>