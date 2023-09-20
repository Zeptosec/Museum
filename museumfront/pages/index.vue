<template>
    <div>
        <div v-if="userStore.user?.role === 'ADMIN'" class="flex justify-center">
            <NuxtLink to="/admin/newmuseum" class="px-3 py-1 rounded-xl bg-tertiary hover:text-secondary">New museum</NuxtLink>
        </div>
        <h1 class="text-4xl text-center font-bold py-2">Museums</h1>
        <section>
            <MuseumCard v-for="museum in museums" :key="museum.id" :museum="museum" />
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
    description: string
}

async function fetchMuseums() {
    if (pending.value) return;
    pending.value = true;
    try {
        const rs = await useFetch(`${config.public.apiBase}/v1/museum/page/${fetchedPage.value}`);
        if (rs.status.value === 'success') {
            const data = rs.data.value as { museums: MuseumData[] };
            museums.value.push(...data.museums);
        } else {
            error.value = getError(rs.data);
        }
    } catch (rr) {
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
onMounted(() => {
    console.log(userStore.user);

})
</script>