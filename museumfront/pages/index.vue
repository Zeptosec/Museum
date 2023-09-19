<template>
    <div>
        <h1 class="text-4xl">Welcome to the homepage</h1>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore';
const userStore = useUserStore();

onMounted(() => {
    console.log(userStore.user);

})
</script>