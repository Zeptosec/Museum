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
        <h2 class="text-center text-2xl font-bold">Items</h2>
        <p v-if="itemData.items.length === 0" class="text-center text-xl font-bold text-error">Category has no
            items</p>
        <section v-else class="grid gap-2 xl:grid-cols-2 mt-2 pb-4 ">
            <ItemCard v-for="item in itemData.items" :item="item" :museumId="category.category.museumId"
                :edit="userStore.user?.role === 'ADMIN'" @remove="deleteItem" />
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
export type APIItems = {
    items: ItemData[]
}

const deleting = ref(false);
async function deleteItem(id: number) {
    if (deleting.value || !userStore.user || !itemData.value) return;
    deleting.value = true;
    try {
        const rs = await AuthFetch(`${config.public.apiBase}/v1/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`
            }
        });
        if (rs.response.ok) {
            itemData.value.items = itemData.value.items.filter(w => w.id !== id);
        } else {
            console.log(rs.json);
            if (rs.json)
                alert(getError(rs.json));
            else
                alert("Failed to delete!");
        }
    } catch (err) {
        console.error(err);
        if (err instanceof Error)
            alert(err.message);
        else
            alert("An error occurred!");
    } finally {
        deleting.value = false;
    }
}

const { data: itemData } = await useFetch<APIItems>(`${config.public.apiBase}/v1/items/${route.params.cid}`);
const { data: category } = await useFetch<{ category: CategoryData }>(`${config.public.apiBase}/v1/categories/${route.params.id}/${route.params.cid}`)
</script>

<style scoped></style>