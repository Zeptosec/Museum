<template>
    <div v-if="itemData && itemData.items && category && category.category">
        <h1 class="text-center text-2xl pb-2 font-bold">{{ category.category.name }}</h1>
        <p class="text-center text-lg border-b border-secondary pb-2 mb-2">{{ category.category.description }}</p>
        <ClientOnly>
            <div v-if="userStore.user?.role === 'ADMIN'" class="flex justify-center py-2">
                <NuxtLink :to="`${route.path}/new`" class="px-3 py-1 rounded-xl bg-tertiary hover:text-secondary">New item
                </NuxtLink>
            </div>
        </ClientOnly>
        <h2 class="text-center text-2xl font-bold">Categories</h2>
        <section class="grid gap-2 xl:grid-cols-2 mt-2 pb-4 ">
            <p v-if="itemData.items.length === 0" class="text-center text-xl font-bold text-error">Category has no
                items</p>
            <ItemCard v-for="item in itemData.items" :item="item" :museumId="category.category.museumId"
                :edit="userStore.user?.role === 'ADMIN'" />
        </section>
    </div>
    <div v-else>
        <h1 class="text-error text-2xl text-center">Failed to get the category with {{ route.params.cid }} id</h1>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore';
import { CategoryData } from '~/components/CategoryCard.vue';
import { ItemData } from '~/components/ItemCard.vue';
const route = useRoute()
const userStore = useUserStore();
const config = useRuntimeConfig();
type APIItems = {
    items: ItemData[]
}

const { data: itemData } = await useFetch<APIItems>(`${config.public.apiBase}/v1/items/${route.params.cid}`);
const { data: category } = await useFetch<{ category: CategoryData }>(`${config.public.apiBase}/v1/categories/${route.params.id}/${route.params.cid}`)
</script>

<style scoped></style>