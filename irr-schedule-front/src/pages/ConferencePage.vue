<template>
    <div class="uk-flex">
        <Sidebar />
        <div class="uk-flex-1 uk-padding main-content">
            <ConferenceTable />
        </div>
    </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
import ConferenceTable from "../components/ConferenceTable.vue";
</script>

<style scoped>
.main-content {
    margin-left: 300px; /* Увеличиваем отступ под новую ширину сайдбара */
}

@media (max-width: 640px) {
    .main-content {
        margin-left: 0; /* На мобильных убираем отступ */
    }

    /* Опционально: можно скрыть сайдбар на мобильных или сделать его адаптивным */
    .sidebar {
        width: 100%; /* Или другое значение для мобильных */
    }
}
</style>
