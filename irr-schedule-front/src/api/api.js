import axios from "axios";

// Создаём экземпляр Axios
const api = axios.create({
  baseURL: "http://localhost:3000/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`, // Добавляем fallback, если токена нет
  },
});

// Перехватчик запросов (обновление токена перед каждым запросом)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Перехватчик ответов (обработка ошибок)
api.interceptors.response.use(
  (response) => response, // Успешный ответ просто возвращаем
  (error) => {
    // Здесь можно обработать конкретные ошибки
    if (error.response) {
      // Сервер ответил с ошибкой (например, 400, 401, 500)
      const status = error.response.status;
      const message =
        error.response.data?.message || "Неизвестная ошибка сервера";
      return Promise.reject({ status, message, data: error.response.data });
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено (например, нет сети)
      return Promise.reject({ status: null, message: "Нет ответа от сервера" });
    } else {
      // Ошибка при настройке запроса
      return Promise.reject({ status: null, message: error.message });
    }
  },
);

/**
 * Функция входа
 */
export const login = async (username, password) => {
  try {
    const response = await api.post("/login", { username, password });
    return { success: true, data: response.data }; // Успешный результат
  } catch (error) {
    // Передаём ошибку дальше с нормализованной структурой
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция создания конференции
 */
export const createConf = async (data) => {
  try {
    const response = await api.post("/conf", data);
    return { success: true, data: response.data }; // Успешный результат
  } catch (error) {
    // Передаём ошибку дальше с нормализованной структурой
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция получения списка конференций
 */
export const getConfs = async () => {
  try {
    const response = await api.get("/api/confs");
    return { success: true, data: response.data }; // Успешный результат
  } catch (error) {
    // Передаём ошибку дальше с нормализованной структурой
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция обновления конференции
 */
export const updateConf = async (id, data) => {
  try {
    const response = await api.put(`/api/confs/${id}`, data);
    return { success: true, data: response.data }; // Успешный результат
  } catch (error) {
    // Передаём ошибку дальше с нормализованной структурой
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция создания пользователя
 */
export const createUser = async (data) => {
  try {
    const response = await api.post("/api/users", data);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция получения списка пользователей
 */
export const getUsers = async () => {
  try {
    const response = await api.get("/api/users");
    return { success: true, data: response.data };
  } catch (error) {
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция обновления пользователя
 */
export const updateUser = async (id, data) => {
  try {
    const response = await api.put(`/api/users/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция удаления пользователя
 */
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/api/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция создания лекции
 */
export const createLecture = async (data) => {
  try {
    const response = await api.post("/api/lecs", data);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция получения дней с лекциями
 */
export const getDays = async () => {
  try {
    const response = await api.get("/api/lecs/days");
    return { success: true, data: response.data };
  } catch (error) {
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция получения списка лекций по дате
 */
export const getDay = async (date) => {
  try {
    const response = await api.get(`/api/lecs/${date}`);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция обновления лекции
 */
export const updateLecture = async (id, data) => {
  try {
    const response = await api.put(`/api/lecs/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

/**
 * Функция удаления лекции
 */
export const deleteLecture = async (id) => {
  try {
    const response = await api.delete(`/api/lecs/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.status) {
      return {
        success: false,
        status: error.status,
        message: error.message,
        data: error.data,
      };
    }
    return { success: false, status: null, message: error.message };
  }
};

export const exportExcel = async () => {
  try {
    const response = await api.get("/api/backup", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = response.headers["content-disposition"];
    let fileName = "backup.xlsx";

    if (contentDisposition && contentDisposition.includes("filename=")) {
      fileName = contentDisposition
        .split("filename=")[1]
        .split(";")[0]
        .replace(/['"]/g, "");
    }

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Ошибка при скачивании файла:", error);
    return { success: false, error };
  }
};

export default api;
