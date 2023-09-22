<template>
    <div>
        <ClientOnly>
            <div v-if="userStore.user?.role === 'ADMIN'" class="flex justify-center">
                <NuxtLink to="/museum/new" class="px-3 py-1 rounded-xl bg-tertiary hover:text-secondary">New museum
                </NuxtLink>
            </div>
        </ClientOnly>
        <h1 class="text-4xl text-center font-bold py-2">Museums</h1>
        <section class="grid gap-4 xl:grid-cols-2 pb-4">
            <MuseumCard v-for="museum in museums" :key="museum.id" @remove="deleteMuseum" :museum="museum"
                :edit="userStore.user?.role === 'ADMIN'" />
        </section>
        <p v-if="error.length > 0" class=" text-error font-bold text-xl text-center">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore';
import { getError } from '~/utils/errors';
const userStore = useUserStore();
const config = useRuntimeConfig();
const fetchedPage = ref(1);
const museums = ref<MuseumData[]>([])
const error = ref('');
const pending = ref(false);
export type MuseumData = {
    id: number,
    name: string,
    description: string,
    imageUrl?: string
}

async function fetchMuseums() {
    if (pending.value) return;
    pending.value = true;
    try {
        const rs = await useFetch(`${config.public.apiBase}/v1/museums`);
        if (rs.status.value === 'success') {
            const data = rs.data.value as { museums: MuseumData[] };
            museums.value.push(...data.museums);
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
await fetchMuseums();

const deleting = ref(false);
async function deleteMuseum(id: number) {
    if (deleting.value || !userStore.user) return;
    deleting.value = true;
    try {
        const rs = await AuthFetch(`${config.public.apiBase}/v1/museums/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`
            }
        });
        if (rs.response.ok) {
            museums.value = museums.value.filter(w => w.id !== id);
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
</script>