<template>
    <div class="bg-secondary p-3 rounded-xl group max-w-xl mx-auto">
        <NuxtLink :to="`/museum/${props.museum.id}`" class="p-1 text-2xl font-bold group-hover:text-tertiary transition-colors">{{ props.museum.name }}</NuxtLink>
        <p class="p-1 text-lg border-t-2 border-primary ">{{ props.museum.description }}</p>
    </div>
</template>

<script setup lang="ts">
import { MuseumData } from '~/pages/index.vue';

const props = defineProps<{
    museum: MuseumData
}>()
</script>

<style scoped>

</style>