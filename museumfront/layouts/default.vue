<template>
    <div>
        <header class="bg-secondary mb-4">
            <Navbar />
        </header>
        <main class="mx-auto max-w-6xl px-2">
            <slot />
        </main>
        <footer>
            
        </footer>
    </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue';
</script>