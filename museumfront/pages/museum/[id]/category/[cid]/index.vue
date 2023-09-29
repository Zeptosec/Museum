<template>
    <div v-if="category && category.category">
        <h1 class="text-center text-2xl pb-2 font-bold">{{ category.category.name }}</h1>
        <p class="text-center text-lg border-b border-secondary pb-2 mb-2">{{ category.category.description }}</p>
        <div v-if="userStore.user?.role === 'ADMIN'" class="flex justify-center py-2">
            <NuxtLink :to="`${route.path}/item/new`" class="px-3 py-1 rounded-xl bg-tertiary hover:text-secondary">New item
            </NuxtLink>
        </div>
        <h2 class="text-center text-2xl font-bold">Items</h2>
        <p v-if="items.length === 0 && !pending" class="text-center text-xl font-bold text-error">Category has no
            items</p>
        <section v-else class="grid gap-2 xl:grid-cols-2 mt-2 pb-4 ">
            <ItemCard v-for="item in items" :item="item" :key="item.id" :museumId="category.category.museumId"
                :edit="category.canEdit" @remove="deleteItem" />
        </section>
        <div class="flex justify-between max-w-xl mx-auto xl:max-w-7xl">
            <div>
                <button v-if="pageParams.page > 1" @click="changePage(-1)">
                    <IconsLeftCircle />
                </button>
            </div>
            <div>
                <button v-if="hasnext" @click="changePage(1)">
                    <IconsRightCircle />
                </button>
            </div>
        </div>
    </div>
    <div v-else-if="pending">
        <h1 class="text-error text-2xl text-center">Failed to get the category with {{ route.params.cid }} id</h1>
    </div>
    <div v-if="pending" class="flex justify-center">
        <Loader />
    </div>
    <SavedModal v-if="showModal.show" @close="showModal.show = false" :title="showModal.title"
        :description="showModal.description" :src="showModal.src" />
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore';
import { CategoryData } from '~/components/CategoryCard.vue';
import { ItemData } from '~/components/ItemCard.vue';
import { ModalInfo } from '~/pages/index.vue';
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const pageParams = ref({ page: safeParseInt(route.query.page), pageSize: 10 });
const config = useRuntimeConfig();
const pending = ref(true);
const hasnext = ref(false);
const errorObj = ref({
    msg: '',
    state: false
})
const showModal = ref<ModalInfo>({
    show: false,
    description: '',
    title: '',
    src: undefined
});
const items = ref<ItemData[]>([])


const deleting = ref(false);
async function deleteItem(id: number) {
    if (deleting.value || !userStore.user) return;
    deleting.value = true;
    const item = items.value.find(w => w.id === id);
    try {
        const rs = await AuthFetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${route.params.cid}/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`
            }
        });
        if (rs.response.ok) {
            if (item) {
                showModal.value = {
                    description: `Item ${item.title} was deleted!`,
                    show: true,
                    title: "Deleted!"
                }
            }
            items.value = items.value.filter(w => w.id !== id);
        } else {
            console.log(rs.json);
            if (item) {
                showModal.value = {
                    description: getError(rs.json),
                    show: true,
                    title: "Failed to delete!",
                    src: '/images/alert-icon.png'
                }
            }
        }
    } catch (err) {
        console.error(err);
        if (item) {
            let msg = "An error occurred!"
            if (err instanceof Error)
                msg = err.message;
            showModal.value = {
                description: msg,
                show: true,
                title: "Failed to delete!",
                src: '/images/alert-icon.png'
            }
        }
    } finally {
        deleting.value = false;
    }
}

async function fetchItems(pass = false) {
    if (pending.value && !pass) return;
    errorObj.value.state = false;
    try {
        const rs = await fetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${route.params.cid}/items?page=${pageParams.value.page}&pageSize=${pageParams.value.pageSize + 1}`);
        const json = await rs.json();
        if (rs.ok) {
            items.value = json.items;
            hasnext.value = json.hasNext;
        } else {
            errorObj.value = {
                msg: getError(json),
                state: true
            }
        }
    } catch (err) {
        errorObj.value = {
            state: true,
            msg: getError(err)
        }
    } finally {
        pending.value = false;
    }
}
fetchItems(true);

async function changePage(amnt: number) {
    if (pending.value) return;
    pageParams.value.page += amnt;
    router.push({
        path: `/museum/${route.params.id}/category/${route.params.cid}`,
        query: {
            ...(pageParams.value.page > 1 ? { page: pageParams.value.page } : {})
        }
    });
    await fetchItems();
}
useHead({
    title: 'Items'
})

const { data: category } = await useFetch<{ category: CategoryData, canEdit: boolean }>(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${route.params.cid}`, {
    headers: {
        'authorization': `Bearer ${userStore.user?.accessToken}`
    }
})
</script>

<style scoped></style>