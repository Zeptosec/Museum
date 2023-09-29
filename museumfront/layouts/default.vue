<template>
    <div>
        <header class="bg-secondary mb-4">
            <Navbar />
        </header>
        <main class="mx-auto max-w-6xl px-2 min-h-[calc(100vh-120px)]">
            <slot />
        </main>
        <footer>
            <p class="py-2 mt-4 text-center">&copy; {{ new Date().getFullYear() }} Museum app Armandas IFF-0/2
            </p>
        </footer>
    </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue';
</script>