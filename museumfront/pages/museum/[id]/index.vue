<template>
    <div v-if="data && data.museum">
        <h1 class="text-center text-2xl pb-2 font-bold">{{ data.museum.name }}</h1>
        <p class="text-center text-lg border-b border-secondary pb-2 mb-2">{{ data.museum.description }}</p>
        <div v-if="userStore.user?.role === 'ADMIN'" class="flex justify-center py-2">
            <NuxtLink :to="`${route.path}/new`" class="px-3 py-1 rounded-xl bg-tertiary hover:text-secondary">New category
            </NuxtLink>
        </div>
        <h2 class="text-center text-2xl font-bold">Categories</h2>
        <div class="grid gap-2">
            <CategoryCard v-for="category in categories" :category="category" />
        </div>
    </div>
    <div v-else>
        <h1 class="text-error text-2xl text-center">Failed to get the museum with {{ route.params.id }} id</h1>
    </div>
</template>

<script setup lang="ts">
import { CategoryData } from '~/components/CategoryCard.vue';
import { MuseumData } from '~/pages/index.vue';
import { useUserStore } from '~/stores/userStore';
type APIBody = {
    museum: MuseumData
}
type APICategories = {
    categories: CategoryData
}
const userStore = useUserStore();
const route = useRoute()
const config = useRuntimeConfig();
const { data } = await useFetch<APIBody>(`${config.public.apiBase}/v1/museum/${route.params.id}`);
const { data: categories} = await useFetch<APICategories>(`${config.public.apiBase}/v1/category/page/${route.params.id}/1`)
</script>

<style scoped></style>