<template>
    <div v-if="data && data.museum">
        <h1 class="text-center text-2xl pb-2 font-bold">{{ data.museum.name }}</h1>
        <p class="text-center text-lg border-b border-secondary pb-2 mb-2">{{ data.museum.description }}</p>
        <ClientOnly>
            <div v-if="userStore.user?.role === 'ADMIN'" class="flex justify-center py-2">
                <NuxtLink :to="`${route.path}/new`" class="px-3 py-1 rounded-xl bg-tertiary hover:text-secondary">New
                    category
                </NuxtLink>
            </div>
        </ClientOnly>
        <h2 class="text-center text-2xl font-bold">Categories</h2>
        <section v-if="cdata" class="grid gap-2 xl:grid-cols-2 mt-2 pb-4 ">
            <p v-if="cdata.categories.length === 0" class="text-center text-xl font-bold text-error">Museum has no
                categories</p>
            <CategoryCard v-for="category in cdata.categories" :category="category" :museum="data.museum"
                :edit="userStore.user?.role === 'ADMIN'" />
        </section>
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
    categories: CategoryData[]
}
const userStore = useUserStore();
const route = useRoute()
const config = useRuntimeConfig();
const { data } = await useFetch<APIBody>(`${config.public.apiBase}/v1/museums/${route.params.id}`);
const { data: cdata } = await useFetch<APICategories>(`${config.public.apiBase}/v1/categories/${route.params.id}`);
</script>

<style scoped></style>