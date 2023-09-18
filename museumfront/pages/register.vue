<template>
    <div class="container mx-auto p-4">
        <div class="w-full md:w-1/2 lg:w-1/3 mx-auto my-12">
            <h1 class="text-2xl font-bold text-center">Register</h1>
            <form @submit.prevent="onSubmit" class="mt-4 text-lg grid gap-4">
                <div class="flex gap-4">
                    <input required type="text" name="name" v-model="userdata.name" placeholder="Name" />
                    <input required type="text" name="sur-name" v-model="userdata.surname" placeholder="Surname" />
                </div>
                <input required
                    :class="errorObj.fields.includes('password') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"
                    type="email" name="email" v-model="userdata.email" placeholder="Email address" />
                <input
                    :class="errorObj.fields.includes('password') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"
                    type="password" name="password" v-model="userdata.password" placeholder="Password" required />
                <input
                    :class="errorObj.fields.includes('repeatPassword') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"
                    type="password" name="repeat-password" v-model="userdata.repeatPassword" placeholder="Repeat Password"
                    required />
                <Loader v-if="pending" class="text-xl mx-auto" />
                <button v-else>
                    Register
                </button>
                <div class="flex justify-center gap-1">
                    <p class="text-xs text-quaternary/60">
                        Registered already?
                    </p>
                    <NuxtLink to="/login" class="font-bold text-xs">Login</NuxtLink>
                </div>
            </form>
            <p v-if="errorObj.msg.length > 0" class="text-error text-center font-bold text-xl mt-1">{{ errorObj.msg }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getZodError } from '~/utils/errors';
const router = useRouter();
const config = useRuntimeConfig();
const userdata = ref({
    name: '',
    surname: '',
    email: '',
    password: '',
    repeatPassword: '',
});
const errorObj = ref<{ fields: string[], msg: string }>({
    fields: [],
    msg: ''
})
const pending = ref(false);
async function onSubmit() {
    if (pending.value) return;
    pending.value = true;
    errorObj.value.fields = [];
    errorObj.value.msg = '';
    try {
        if (userdata.value.password !== userdata.value.repeatPassword) {
            errorObj.value.fields.push('password');
            errorObj.value.fields.push('repeatPassword');
            errorObj.value.msg = "Passwords do not match";
            return;
        }

        const { data, error } = await useFetch(`${config.public.apiBase}/auth/register`, {
            server: false,
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: userdata.value.name,
                surname: userdata.value.surname,
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
                }
            } else {
                errorObj.value.msg = error.value.message;
            }
            console.error(error.value);
            return;
        }
        router.push('/login');
    } catch (err) {
        console.error(err);
    } finally {
        pending.value = false;
    }
}
</script>

<style scoped></style>