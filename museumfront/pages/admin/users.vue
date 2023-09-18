<template>
    <div>
        <p class=" text-error font-bold text-xl text-center">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { useUserStore, Roles } from '~/stores/userStore';
import { getZodError } from '~/utils/errors';
type UserInfo = {
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
    console.log("about to fetch")
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