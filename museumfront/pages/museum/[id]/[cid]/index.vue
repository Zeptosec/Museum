<template>
    <div v-if="cdata && cdata.category">
        <h1 class="text-center text-2xl pb-2 font-bold">{{ cdata.category.name }}</h1>
        <p class="text-center text-lg border-b border-secondary pb-2 mb-2">{{ cdata.category.description }}</p>
        <div v-if="userStore.user?.role === 'ADMIN'" class="flex justify-center py-2">
            <NuxtLink :to="`${route.path}/new`" class="px-3 py-1 rounded-xl bg-tertiary hover:text-secondary">New item
            </NuxtLink>
        </div>
    </div>
    <div v-else>
        <h1 class="text-error text-2xl text-center">Failed to get the category with {{ route.params.cid }} id</h1>
    </div>
</template>

<script setup lang="ts">
import { CategoryData } from '~/components/CategoryCard.vue';
import { useUserStore } from '~/stores/userStore';

const route = useRoute()
const userStore = useUserStore();
const config = useRuntimeConfig();
type APICategory = {
    category: CategoryData & {
        museumId: number,
        museum: {
            name: string
        }
    }
}
const { data: cdata } = useFetch<APICategory>(`${config.public.apiBase}/v1/categories/${route.params.id}/${route.params.cid}`);
</script>

<style scoped></style>