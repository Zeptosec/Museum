<template>
    <div>
        <div class="bg-secondary mb-4">
            <Navbar />
        </div>
        <main class="mx-auto max-w-6xl px-2">
            <slot />
        </main>
    </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue';
</script>