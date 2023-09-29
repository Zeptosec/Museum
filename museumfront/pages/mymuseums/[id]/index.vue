<template>
    <div v-if="data && data.museum">
        <h1 class="text-center text-2xl pb-2 font-bold">{{ data.museum.name }}</h1>
        <p class="text-center text-lg border-b border-secondary pb-2 mb-2">{{ data.museum.description }}</p>
        <div v-if="userStore.user?.role === 'ADMIN'" class="flex justify-center py-2">
            <NuxtLink :to="`${route.path}/category/new`" class="px-3 py-1 rounded-xl bg-tertiary hover:text-secondary">New
                category
            </NuxtLink>
        </div>
        <h2 class="text-center text-2xl font-bold">My categories</h2>
        <p v-if="categories.length === 0 && !pending" class="text-center text-xl font-bold text-error">
            Museum has no
            categories</p>
        <section v-if="categories.length > 0" class="grid gap-2 xl:grid-cols-2 mt-2 pb-4">
            <CategoryCard v-for="category in categories" :key="category.id" :category="category" :museum="data.museum"
                :edit="userStore.user?.role === 'ADMIN'" @remove="deleteCategory"
                :url="`/museum/${route.params.id}/category/${category.id}`" />
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
    <div v-else>
        <h1 class="text-error text-2xl text-center">Failed to get the museum with {{ route.params.id }} id</h1>
    </div>
    <div v-if="pending" class="flex justify-center">
        <Loader />
    </div>
    <div v-if="errorObj.state" class="text-error text-xl text-center">{{ errorObj.msg }}</div>
    <SavedModal v-if="showModal.show" @close="showModal.show = false" :title="showModal.title"
        :description="showModal.description" :src="showModal.src" />
</template>

<script setup lang="ts">
import { CategoryData } from '~/components/CategoryCard.vue';
import { ModalInfo, MuseumData } from '~/pages/index.vue';
import { useUserStore } from '~/stores/userStore';
const categories = ref<CategoryData[]>([])
type APIBody = {
    museum: MuseumData
}
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const config = useRuntimeConfig();
const pending = ref(true);
const pageParams = ref({ page: safeParseInt(route.query.page), pageSize: 10 });
const hasnext = ref(false);
const showModal = ref<ModalInfo>({
    show: false,
    description: '',
    title: '',
    src: undefined
});
const errorObj = ref({
    msg: '',
    state: false
})
const { data } = await useFetch<APIBody>(`${config.public.apiBase}/v1/museums/${route.params.id}`);

async function fetchCategories(pass = false) {
    if (pending.value && !pass) return;
    errorObj.value.state = false;
    try {
        const rs = await AuthFetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/search?page=${pageParams.value.page}&pageSize=${pageParams.value.pageSize}`, {
            headers: {
                'Authorization': `Bearer ${userStore.user?.accessToken}`
            }
        });
        const json = await rs.json;
        if (rs.response.ok) {
            categories.value = json.categories;
            hasnext.value = json.hasNext;
        } else {
            errorObj.value = {
                msg: getError(json),
                state: true
            }
        }
    } catch (err) {
        errorObj.value = {
            msg: getError(err),
            state: true
        }
    } finally {
        pending.value = false;
    }
}
fetchCategories(true);

async function changePage(amnt: number) {
    if (pending.value) return;
    pageParams.value.page += amnt;
    router.push({
        path: `/museum/${route.params.id}`,
        query: {
            ...(pageParams.value.page > 1 ? { page: pageParams.value.page } : {})
        }
    });
    await fetchCategories();
}

const deleting = ref(false);
async function deleteCategory(id: number) {
    if (deleting.value || !userStore.user || categories.value.length === 0) return;
    deleting.value = true;
    const category = categories.value.find(w => w.id === id);
    try {
        const rs = await AuthFetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`
            }
        });
        if (rs.response.ok) {
            if (category) {
                showModal.value = {
                    description: `Category ${category.name} was deleted!`,
                    show: true,
                    title: "Deleted!"
                }
            }
            categories.value = categories.value.filter(w => w.id !== id);
        } else {
            console.log(rs.json);
            if (category) {
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
        if (category) {
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
useHead({
    title: 'My categories'
})
onMounted(() => {
    if (!userStore.user || userStore.user.role === 'GUEST')
        router.push('/');
})
</script>

<style scoped></style>