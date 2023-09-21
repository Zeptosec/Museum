<template>
    <div class="max-w-sm mt-7 mx-auto text-center">
        <p class="mt-7 text-7xl font-bold">{{ error.statusCode }}</p>
        <p class="mt-7 text-6xl">Wait a minute!</p>
        <p class="mt-7">{{ error.message }}</p>
        <button @click="handleClick">Back to home</button>
    </div>
</template>

<script setup lang="ts">
defineProps(['error'])
function handleClick() {
    clearError({ redirect: '/' })
}
</script>

<style scoped></style>