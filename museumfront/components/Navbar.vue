<template>
    <nav class="w-full flex max-w-6xl justify-between p-2 mx-auto">
        <div>
            <NuxtLink to="/">
                <h2 class="text-2xl font-bold">
                    Museum app
                </h2>
            </NuxtLink>
        </div>
        <ClientOnly>
            <div v-if="!userStore.user" class="flex gap-2">
                <NuxtLink to="/login">
                    Login
                </NuxtLink>
                <NuxtLink to="/register">
                    Register
                </NuxtLink>
            </div>
            <div v-else class="flex gap-2">
                <p class="leading-[32px] text-tertiary">{{ userStore.user.name }}</p>
                <button @click="logout" class="p-0 text-quaternary hover:text-tertiary bg-transparent">
                    Logout
                </button>
                <NuxtLink v-if="userStore.user.role === 'ADMIN'" to="/admin/users">
                    Users
                </NuxtLink>
                <!-- <NuxtLink v-if="userStore.user.role === 'ADMIN'" to="/admin/museum">New museum</NuxtLink> -->
            </div>
            <template #fallback>
                <Loader class="text-sm mt-2" />
            </template>
        </ClientOnly>
    </nav>
</template>

<script setup lang="ts">

import { useUserStore } from '~/stores/userStore';
const config = useRuntimeConfig();
const userStore = useUserStore();
const router = useRouter();

async function logout() {
    if (!userStore.user) return;
    const { response } = await AuthFetch(`${config.public.apiBase}/auth/logout`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${userStore.user.accessToken}`
        }
    });
    if (response.ok) {
        userStore.user = undefined;
        router.push('/');
    }
}
</script>