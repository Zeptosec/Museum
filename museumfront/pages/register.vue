<template>
    <div class="container mx-auto p-4 bg-white">
        <div class="w-full md:w-1/2 lg:w-1/3 mx-auto my-12">
            <h1 class="text-2xl font-bold text-center">Register</h1>
            <form @submit.prevent="onSubmit" class="flex flex-col mt-4 text-lg">
                <div class="flex gap-4">
                    <input type="text" name="name" v-model="userdata.name"
                        class="px-4 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                        placeholder="Name" />
                    <input type="text" name="sur-name" v-model="userdata.surname"
                        class="px-4 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                        placeholder="Surname" />
                </div>
                <input type="email" name="email" v-model="userdata.email"
                    class="px-4 py-3 mt-4 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                    placeholder="Email address" />
                <input type="password" name="password" v-model="userdata.password"
                    class="px-4 py-3 mt-4 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                    placeholder="Password" />
                <input type="password" name="repeat-password" v-model="userdata.repeatPassword"
                    class="px-4 py-3 mt-4 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                    placeholder="Repeat Password" />
                <button type="submit"
                    class="mt-4 px-4 py-3 leading-6 rounded-md border border-transparent focus:outline-none bg-blue-500 text-blue-100 hover:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer inline-flex items-center w-full justify-center font-medium">
                    Register
                </button>
                <div class="flex flex-col items-center mt-5">
                    <p class="mt-1 text-xs font-light text-gray-500">
                        Register already?
                        <NuxtLink to="/login" class="ml-1 font-medium text-blue-400">Login</NuxtLink>
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
const userdata = ref({
    name: '',
    surname: '',
    email: '',
    password: '',
    repeatPassword: ''
});
async function onSubmit() {
    console.log(userdata.value);
}
</script>

<style scoped></style>