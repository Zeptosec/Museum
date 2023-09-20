<template>
    <div class="bg-secondary p-3 rounded-xl group max-w-xl mx-auto w-full">
        <NuxtLink :to="`/museum/${props.museum.id}/${props.category.id}`" class="p-1 text-2xl font-bold group-hover:text-tertiary transition-colors">{{ props.category.name }}</NuxtLink>
        <p class="p-1 text-lg transition-colors border-t-2 border-primary group-hover:border-tertiary">{{ props.category.description }}</p>
    </div>
</template>

<script setup lang="ts">
import { MuseumData } from '~/pages/index.vue';

export type CategoryData = {
    id: number,
    name: string,
    description: string,
}
const props = defineProps<{
    category: CategoryData,
    museum: MuseumData
}>()
</script>

<style scoped>

</style>