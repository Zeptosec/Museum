<template>
    <div class="bg-secondary p-3 rounded-xl group max-w-xl mx-auto">
        <NuxtLink :to="`/museum/${props.category.id}`" class="p-1 text-2xl font-bold group-hover:text-tertiary transition-colors">{{ props.category.name }}</NuxtLink>
        <p class="p-1 text-lg border-t-2 border-primary ">{{ props.category.description }}</p>
    </div>
</template>

<script setup lang="ts">
export type CategoryData = {
    id: number,
    name: string,
    description: string,
}
const props = defineProps<{
    category: CategoryData
}>()
</script>

<style scoped>

</style>