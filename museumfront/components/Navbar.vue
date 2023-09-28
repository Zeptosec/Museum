<template>
    <nav class="w-full max-w-6xl p-2 mx-auto relative">
        <section class="sm:flex hidden w-full justify-between ">
            <div>
                <NuxtLink to="/">
                    <h2 class="text-2xl font-bold">
                        Museum app
                    </h2>
                </NuxtLink>
            </div>
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
        </section>
        <section class="w-full grid sm:hidden">
            <div class="flex justify-between items-center">
                <NuxtLink to="/">
                    <h2 class="text-2xl font-bold">
                        Museum app
                    </h2>
                </NuxtLink>
                <span @click="menu = !menu" class="cursor-pointer hover:text-tertiary transition-colors">
                    <IconsCross v-if="menu" />
                    <IconsMenu v-else />
                </span>
            </div>
            <ul v-if="!userStore.user"
                class="text-right text-xl transition-all overflow-hidden absolute top-[48px] w-full right-0 pr-3 bg-secondary"
                :class="menu ? 'max-h-[200px]' : 'max-h-0'">
                <li class="py-1">
                    <NuxtLink to="/login">
                        Login
                    </NuxtLink>
                </li>
                <li class="py-1">
                    <NuxtLink to="/register">
                        Register
                    </NuxtLink>
                </li>
            </ul>
            <ul v-else
                class="text-right text-xl transition-all overflow-hidden absolute top-[48px] w-full right-0 px-3 bg-secondary"
                :class="menu ? 'max-h-[200px]' : 'max-h-0'">
                <li class="py-1">
                    <p class="leading-[32px] text-tertiary">{{ userStore.user.name }}</p>
                </li>
                <li class="py-1">
                    <span @click="logout" class="hover:text-tertiary cursor-pointer transition-colors">
                        Logout
                    </span>
                </li>
                <li class="py-1">
                    <NuxtLink v-if="userStore.user.role === 'ADMIN'" to="/admin/users">
                        Users
                    </NuxtLink>
                </li>
            </ul>
        </section>
    </nav>
</template>

<script setup lang="ts">

import { useUserStore } from '~/stores/userStore';
const config = useRuntimeConfig();
const userStore = useUserStore();
const router = useRouter();
const menu = ref(false);

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