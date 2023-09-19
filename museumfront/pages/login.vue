<template>
    <div class="container mx-auto p-4">
        <div class="w-full md:w-1/2 lg:w-1/3 mx-auto my-12">
            <h1 class="text-2xl font-bold text-center">Login</h1>
            <form @submit.prevent="onSubmit" class="mt-4 text-lg grid gap-4">

                <input required
                    :class="errorObj.fields.includes('password') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"
                    type="email" name="email" v-model="userdata.email" placeholder="Email address" />
                <input
                    :class="errorObj.fields.includes('password') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"
                    type="password" name="password" v-model="userdata.password" placeholder="Password" required />

                <Loader v-if="pending" class="text-xl mx-auto" />
                <button v-else>
                    Login
                </button>
                <div class="flex justify-center gap-1">
                    <p class="text-xs text-quaternary/60">
                        Don't have an account?
                    </p>
                    <NuxtLink to="/register" class="font-bold text-xs">Register</NuxtLink>
                </div>
            </form>
            <p v-if="errorObj.msg.length > 0" class="text-error text-center font-bold text-xl mt-1">{{ errorObj.msg }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { UserData, useUserStore } from '~/stores/userStore';
import { getZodError } from '~/utils/errors';
const userStore = useUserStore();
const router = useRouter();
const config = useRuntimeConfig();
const pending = ref(false);
const userdata = ref({
    email: '',
    password: '',
});
const errorObj = ref<{ fields: string[], msg: string }>({
    fields: [],
    msg: ''
})

async function onSubmit() {
    if (pending.value) return;
    pending.value = true;
    try {
        const { data, error } = await useFetch(`${config.public.apiBase}/auth/login`, {
            server: false,
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email: userdata.value.email,
                password: userdata.value.password
            })
        })

        if (error && error.value) {
            if (error.value.data) {
                const zodErrors = getZodError(error.value.data);
                if (zodErrors) {
                    errorObj.value.fields = zodErrors.map(w => w.field);
                    errorObj.value.msg = zodErrors.map(w => w.message).join(', ');
                } else if ('errors' in error.value.data && Array.isArray(error.value.data.errors)) {
                    errorObj.value.msg = error.value.data.errors.join(', ');
                } else {
                    errorObj.value.msg = error.value.message;
                }
            } else {
                errorObj.value.msg = error.value.message;
            }
            console.error(error.value);
            return;
        }
        const resData = data.value as UserData
        userStore.setUser(resData);
        router.push('/')
    } catch (err) {
        console.error(err);
    } finally {
        pending.value = false;
    }
}
</script>

<style scoped></style>