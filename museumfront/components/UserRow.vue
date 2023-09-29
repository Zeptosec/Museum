<template>
    <tr class="border-b hover:bg-secondary/25 transition-colors"
        :class="changed === 1 ? 'success' : changed === 2 ? 'failed' : ''">
        <td class="p-3 px-5">{{ user.id }}</td>
        <td class="p-3 px-5">{{ user.email }}</td>
        <td class="p-3 px-5">{{ user.name }} {{ user.surname }}</td>
        <td class="p-3 px-5">
            <select :disabled="fetching" class="bg-transparent outline-none" v-model="userRole"
                @change="(w: any) => changeRole(user, w.target.value)">
                <option :selected="role === user.role" :value="role" v-for="role in rolesList" class="bg-secondary">{{ role
                }}</option>
            </select>
        </td>
    </tr>
</template>

<script setup lang="ts">
import { UserInfo } from '~/pages/admin/users.vue';
import { RolesEnum, useUserStore } from '~/stores/userStore';
const props = defineProps<{
    user: UserInfo
}>()
const config = useRuntimeConfig();
const userStore = useUserStore();
const rolesList = Object.keys(RolesEnum);
const changed = ref(0);
const userRole = ref(props.user.role);
const error = ref("");
const fetching = ref(false)

async function changeRole(user: UserInfo, newRole: string) {
    if (fetching.value) return;
    changed.value = 0;
    fetching.value = true;
    if (!userStore.user) return;
    let rs;
    try {
        rs = await AuthFetch(`${config.public.apiBase}/v1/admin/user/role/${user.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newRole
            })
        })
        if (rs.response.ok) {
            changed.value = 1;
        } else {
            error.value = "Failed to change role!";
            changed.value = 2;
            userRole.value = user.role;
            alert(error.value)
        }
    } catch (rr) {
        changed.value = 2;
        userRole.value = user.role;
        console.error(rr);
        if (rr instanceof Error) {
            error.value = rr.message;
        } else
            error.value = "Failed to change role!";
        alert(error.value)
    } finally {
        fetching.value = false;
    }
}
</script>

<style scoped>
.success {
    background-color: rgb(132, 204, 22);
    animation: colind 10s ease-in-out forwards;
}

.failed {
    background-color: rgb(196, 24, 24);
    animation: colind 10s ease-in-out forwards;
}

@keyframes colind {
    5% {
        background-color: color;
    }

    100% {
        background-color: transparent;
    }
}
</style>