<template>
    <div>
        <div v-if="userStore.user?.role === 'ADMIN'" class="flex justify-center">
            <NuxtLink to="/museum/new" class="px-3 py-1 rounded-xl bg-tertiary hover:text-secondary">New museum
            </NuxtLink>
        </div>
        <h1 class="text-4xl text-center font-bold py-2">Museums</h1>
        <div v-if="museums.length > 0">
            <section class="grid gap-4 xl:grid-cols-2 pb-4">
                <MuseumCard v-for="museum in museums" :key="museum.id" @remove="deleteMuseum" :museum="museum"
                    :edit="userStore.user?.role === 'ADMIN'" />
            </section>
        </div>
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
        <div v-if="pending" class="flex justify-center">
            <Loader />
        </div>
        <p v-else-if="museums.length === 0" class="text-center text-2xl text-error">No museums</p>
        <p v-if="error.length > 0" class=" text-error font-bold text-xl text-center">{{ error }}</p>
        <SavedModal v-if="showModal.show" @close="showModal.show = false" :title="showModal.title"
            :description="showModal.description" :src="showModal.src" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore';
import { getError } from '~/utils/errors';
import { safeParseInt } from '~/utils/utils';
const userStore = useUserStore();
const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();
const pageParams = ref({ page: safeParseInt(route.query.page), pageSize: 10 });
const museums = ref<MuseumData[]>([])
const hasnext = ref(false);
const error = ref('');
const pending = ref(true);
export type ModalInfo = {
    show: boolean,
    description: string,
    title: string,
    src?: string
}
const showModal = ref<ModalInfo>({
    show: false,
    description: '',
    title: '',
    src: undefined
});
export type MuseumData = {
    id: number,
    name: string,
    description: string,
    imageUrl?: string
}

async function fetchMuseums(pass = false) {
    if (pending.value && !pass) return;
    pending.value = true;
    try {
        const rs = await useFetch(`${config.public.apiBase}/v1/museums?page=${pageParams.value.page}&pageSize=${pageParams.value.pageSize}`);
        if (rs.status.value === 'success') {
            const data = rs.data.value as { museums: MuseumData[], hasNext: boolean };
            museums.value = data.museums;
            hasnext.value = data.hasNext;
        } else {
            error.value = getError(rs.data);
        }
    } catch (rr) {
        console.error(rr);
        if (rr instanceof Error) {
            error.value = rr.message;
        } else {
            error.value = "Failed to get museums!";
        }
    } finally {
        pending.value = false;
    }
}

async function changePage(amnt: number) {
    if (pending.value) return;
    pageParams.value.page += amnt;
    router.push({
        path: '/',
        query: {
            ...(pageParams.value.page > 1 ? { page: pageParams.value.page } : {})
        }
    });
    await fetchMuseums();
}

const deleting = ref(false);
async function deleteMuseum(id: number) {
    if (deleting.value || !userStore.user) return;
    deleting.value = true;
    const museum = museums.value.find(w => w.id === id);
    try {
        const rs = await AuthFetch(`${config.public.apiBase}/v1/museums/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`
            }
        });
        if (rs.response.ok) {
            if (museum) {
                showModal.value = {
                    description: `Museum ${museum.name} was deleted!`,
                    show: true,
                    title: "Deleted!"
                }
            }
            museums.value = museums.value.filter(w => w.id !== id);
        } else {
            console.log(rs.json);
            if (museum) {
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
        if (museum) {
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
await fetchMuseums(true);
</script>