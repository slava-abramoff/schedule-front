<template>
    <div class="uk-card lecture-card">
        <div class="uk-card-body">
            <!-- Дата -->
            <h3 class="uk-card-title" style="font-size: 25px">
                {{ formattedDate }}
            </h3>

            <!-- Количество лекций -->
            <p class="uk-text-lead">
                Лекций: <span class="highlight">{{ data.lections_count }}</span>
            </p>

            <!-- Группы -->
            <p class="uk-text-muted">
                Группы: <span class="highlight">{{ formattedGroups }}</span>
            </p>

            <!-- Лекторы -->
            <p class="uk-text-muted">
                Лекторы: <span class="highlight">{{ formattedLectors }}</span>
            </p>

            <!-- Кнопки списком -->
            <ul class="uk-list button-list">
                <li>
                    <button
                        class="uk-button uk-button-primary custom-button"
                        @click="openDay"
                    >
                        <span
                            uk-icon="calendar"
                            class="uk-margin-small-right"
                        ></span>
                        Расписание
                    </button>
                </li>
                <li>
                    <button
                        class="uk-button uk-button-secondary custom-button"
                        @click="connect"
                    >
                        <span
                            uk-icon="link"
                            class="uk-margin-small-right"
                        ></span>
                        Подключение
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            required: true,
        },
    },
    computed: {
        formattedDate() {
            return this.data.date.replace(/-/g, ".");
        },
        formattedGroups() {
            return this.data.groups.join(", ");
        },
        formattedLectors() {
            return this.data.lectors.join(", ");
        },
    },
    methods: {
        openDay() {
            this.$router.push(`/lectures/${this.data.date}`);
        },
        connect() {
            this.$router.push(`/connecting/${this.data.date}`);
        },
    },
};
</script>

<style scoped>
.lecture-card {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
    transition: box-shadow 0.2s ease;
}

.lecture-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.uk-card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
}

.uk-text-lead {
    font-size: 1rem;
    color: #666;
    margin: 8px 0;
}

.uk-text-muted {
    font-size: 0.95rem;
    color: #888;
    margin: 8px 0;
}

.highlight {
    color: #1e87f0;
    font-weight: 500;
}

.button-list {
    margin: 12px 0 0 0;
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

.uk-card-body {
    padding: 16px;
}
</style>
