<template>
    <div class="mx-auto max-w-5xl px-2">
        <Navbar />
        <slot />
    </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue';
</script>