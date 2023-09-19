<template>
    <div>
        <section v-if="users">
            <p v-if="users.length === 0" class="text-center text-error text-2xl">No users</p>
            <table v-if="users.length > 0" class="w-full">
                <thead>
                    <tr class="border-b">
                        <th class="text-left p-3 px-5">ID</th>
                        <th class="text-left p-3 px-5">Email</th>
                        <th class="text-left p-3 px-5">Full name</th>
                        <th class="text-left p-3 px-5">Role</th>
                    </tr>
                </thead>
                <tbody>
                    <UserRow :user="user" v-for="user in users" />
                </tbody>
            </table>
        </section>
        <p v-if="error.length > 0" class=" text-error font-bold text-xl text-center">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { useUserStore, Roles, RolesEnum } from '~/stores/userStore';
import { getZodError } from '~/utils/errors';
export type UserInfo = {
    createdAt: Date,
    email: string,
    id: number,
    name: string,
    surname: string,
    role: Roles
}
const router = useRouter();
const config = useRuntimeConfig();
const userStore = useUserStore();
const page = ref(1);
const users = ref<UserInfo[] | undefined>();
const error = ref("");

async function fetchUsers() {
    if (!userStore.user) return;
    try {
        const rs = await AuthFetch(`${config.public.apiBase}/v1/admin/users?page=${page.value}`, {
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`
            }
        });
        if (rs.response.ok) {
            if (!users.value)
                users.value = rs.json.users;
            else
                users.value.push(...rs.json.users);
        } else {
            console.log(rs);
            const rr = getZodError(rs.json);
            if (rr) {
                error.value = rr.map(w => `${w.field}: ${w.message}`).join(', ');
            } else if (rs.json && rs.json.errors) {
                error.value = rs.json.errors.join(', ');
            } else {
                error.value = "An error occurred!";
            }
        }
    } catch (rr: unknown) {
        console.error("Got an error");
        console.error(rr);
        if (rr instanceof Error) {
            error.value = rr.message;
        } else {
            error.value = "Failed to fetch";
        }
    }
}

onMounted(() => {
    if (userStore.user?.role !== 'ADMIN') {
        router.push('/');
    } else {
        fetchUsers();
    }
})
</script>

<style scoped></style>