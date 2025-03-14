<template>
  <div class="uk-container uk-container-expand uk-margin-top main-container">
    <!-- Панель кнопок списком -->
    <div class="uk-flex uk-flex-between uk-flex-wrap uk-margin-bottom">
      <div class="uk-margin-small-bottom">
        <button class="uk-button excel-button" @click="exportToExcel">
          <span uk-icon="icon: download" class="uk-margin-small-right"></span>
          Экспорт в Excel
        </button>
      </div>
      <div class="uk-margin-small-bottom">
        <button class="uk-button uk-button-primary" @click="openModal">
          <span uk-icon="icon: calendar" class="uk-margin-small-right"></span>
          Запланировать лекцию
        </button>
      </div>
    </div>

    <!-- Модальное окно для создания запланированной лекции -->
    <ModalWrapper ref="modalRef" title="Планирование лекции">
      <div class="modal-content">
        <div class="uk-margin">
          <label class="uk-form-label custom-label">Дата:</label>
          <input class="uk-input custom-input" type="date" v-model="futureLecture.date" required />
        </div>

        <div class="uk-margin">
          <label class="uk-form-label custom-label">Время начала:</label>
          <input class="uk-input custom-input" type="time" v-model="futureLecture.start_time" required />
        </div>

        <div class="uk-margin">
          <label class="uk-form-label custom-label">Время окончания:</label>
          <input class="uk-input custom-input" type="time" v-model="futureLecture.end_time" required />
        </div>

        <div class="uk-margin">
          <label class="uk-form-label custom-label">Платформа:</label>
          <input
            class="uk-input custom-input"
            type="text"
            v-model="futureLecture.platform"
            placeholder="Введите платформу"
            required
          />
        </div>

        <div class="uk-margin">
          <label class="uk-form-label custom-label">Корпус:</label>
          <select class="uk-select custom-input" v-model="futureLecture.building" required>
            <option value="">Выберите корпус</option>
            <option value="A">Корпус 1</option>
            <option value="B">Корпус 2</option>
          </select>
        </div>

        <div class="uk-margin">
          <label class="uk-form-label custom-label">Местоположение:</label>
          <input
            class="uk-input custom-input"
            type="text"
            v-model="futureLecture.location"
            placeholder="Введите местоположение"
            required
          />
        </div>

        <div class="uk-margin">
          <label class="uk-form-label custom-label">Группы:</label>
          <input
            class="uk-input custom-input"
            type="text"
            v-model="futureLecture.groups"
            placeholder="Введите группы"
            required
          />
        </div>

        <div class="uk-margin">
          <label class="uk-form-label custom-label">Лекторы:</label>
          <input
            class="uk-input custom-input"
            type="text"
            v-model="futureLecture.lectors"
            placeholder="Введите лекторов"
            required
          />
        </div>

        <ul class="uk-list button-list uk-margin">
          <li>
            <button class="uk-button uk-button-primary custom-button" @click="scheduleLecture">
              <span uk-icon="calendar"></span> Запланировать
            </button>
          </li>
          <li>
            <button class="uk-button uk-button-secondary custom-button" @click="closeModal">
              <span uk-icon="close"></span> Отменить
            </button>
          </li>
        </ul>
      </div>
    </ModalWrapper>

    <!-- Контейнер для блоков лекций -->
    <div class="lectures-container">
      <LectureBlock v-for="lecture in sortedLectures" :key="lecture.date" :data="lecture" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { createLecture, getDays, exportExcel } from '../api/api';
import LectureBlock from './LectureBlock.vue';
import ModalWrapper from './ModalWrapper.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const modalRef = ref(null);
const lectures = ref([]);

const futureLecture = ref({
  date: '',
  start_time: '',
  end_time: '',
  platform: '',
  building: '',
  location: '',
  groups: '',
  lectors: ''
});

const toISOFormat = (time, date) => {
  if (!time || !date) return '';
  const combined = `${date}T${time}:00Z`;
  const isoDate = new Date(combined);
  return isoDate.toISOString();
};

// Вычисляемое свойство для сортировки лекций по убыванию даты
const sortedLectures = computed(() => {
  return [...lectures.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const openModal = () => {
  modalRef.value.openModal();
};

const closeModal = () => {
  modalRef.value.closeModal();
};

const exportToExcel = async () => {
  await exportExcel();
};

const scheduleLecture = async () => {
  const lectureData = {
    ...futureLecture.value,
    start_time: toISOFormat(futureLecture.value.start_time, futureLecture.value.date),
    end_time: toISOFormat(futureLecture.value.end_time, futureLecture.value.date),
    corps: futureLecture.value.building
  };

  const result = await createLecture(lectureData);
  if (result.success) {
    console.log(result.data);
    lectures.value.push(result.data); // Добавляем новую лекцию в массив
    router.push(`/lectures/${result.data.date}`);
    closeModal();
    futureLecture.value = {
      date: '',
      start_time: '',
      end_time: '',
      abnormal_time: '',
      platform: '',
      building: '',
      location: '',
      groups: '',
      lectors: ''
    };
  } else {
    console.error('Ошибка добавления лекции:', result.message);
    UIkit.notification({
      message: `Ошибка: ${result.message}`,
      status: 'danger'
    });
  }
};

onMounted(async () => {
  const result = await getDays();
  if (result.success) {
    lectures.value = result.data;
  } else {
    console.error('Ошибка загрузки лекций:', result.message);
    UIkit.notification({
      message: `Ошибка: ${result.message}`,
      status: 'danger'
    });
  }
});
</script>

<style scoped>
.main-container {
  padding: 0 16px;
}

.button-list {
  margin: 0;
  padding: 0;
}

.button-list li {
  margin-bottom: 8px;
}

.custom-button {
  width: 100%;
  padding: 8px 12px;
  font-size: 0.9rem;
  text-align: left;
  border: none;
  transition: background-color 0.2s ease;
}

.excel-button {
  background-color: #2ecc71;
  color: #fff;
}

.excel-button:hover {
  background-color: #27ae60;
}

.uk-button-primary {
  background-color: #1e87f0;
  color: #fff;
}

.uk-button-primary:hover {
  background-color: #1668c4;
}

.uk-button-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.uk-button-secondary:hover {
  background-color: #e5e5e5;
}

.lectures-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border: 1px solid #eee;
}

.modal-content {
  padding: 16px;
}

.custom-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 6px;
  display: block;
}

.custom-input {
  border: 1px solid #ddd;
  padding: 8px 12px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.custom-input:focus {
  border-color: #1e87f0;
  outline: none;
  box-shadow: 0 0 4px rgba(30, 135, 240, 0.3);
}
</style>