<template>
    <div class="relative pt-[60px]">
        <div class="w-full h-8 absolute bg-secondary bottom-0 -z-10"></div>
        <svg class="absolute bottom-3 -z-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"
            preserveAspectRatio="none" width="100%" height="90px">
            <path fill="#393e46" fill-opacity="1"
                d="M0,96L48,117.3C96,139,192,181,288,181.3C384,181,480,139,576,149.3C672,160,768,224,864,229.3C960,235,1056,181,1152,154.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            </path>
        </svg>
        <p class="text-center pb-1"><span class="font-sans">&copy;</span> {{ new Date().getFullYear() }} Museum
            app
            Armandas IFF-0/2
        </p>

    </div>
</template>

<script setup lang="ts">

</script>

<style scoped></style>