<template>
    <div class="uk-flex">
        <Sidebar />
        <div class="uk-flex-1 uk-padding main-content">
            <DateDetailsAdmin />
        </div>
    </div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue';
import DateDetailsAdmin from '../components/DateDetailsAdmin.vue';
</script>

<style scoped>
.main-content {
  margin-left: 240px; /* Отступ равный ширине сайдбара */
}

@media (max-width: 640px) {
  .main-content {
    margin-left: 0; /* На мобильных можно убрать отступ */
  }
}
</style>