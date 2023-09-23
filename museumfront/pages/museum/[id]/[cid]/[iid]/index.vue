<template>
    <section>
        <template v-if="itemData && itemData.item">
            <h1 class="text-center text-4xl font-bold">{{ itemData.item.title }}</h1>
            <p class="text-lg px-2 md:px-8 py-2 md:py-4">{{ itemData.item.description }}</p>
            <NuxtImg v-if="itemData.item.imageUrl" :src="itemData.item.imageUrl" class=" rounded-xl w-5/6 mx-auto" />
        </template>
    </section>
</template>

<script setup lang="ts">
import { CategoryData } from '~/components/CategoryCard.vue';
import { ItemData } from '~/components/ItemCard.vue';
const config = useRuntimeConfig()
const route = useRoute()
const { data: itemData } = await useFetch<{ item: ItemData }>(`${config.public.apiBase}/v1/items/${route.params.cid}/${route.params.iid}`);
console.log(itemData.value)
const { data: category } = await useFetch<{ category: CategoryData }>(`${config.public.apiBase}/v1/categories/${route.params.id}/${route.params.cid}`)
</script>

<style scoped></style>