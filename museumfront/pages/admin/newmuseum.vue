<template>
    <div class="mx-auto max-w-xl">
        <h1 class="text-2xl font-bold text-center">New museum</h1>
        <form @submit.prevent="onSubmit" class="mt-4 text-lg grid gap-4">
            <input required type="text" name="name" v-model="museumData.name" placeholder="Name"
                :class="errorObj.fields.includes('name') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''" />
            <textarea name="dsc" id="dsc" cols="30" rows="10" placeholder="Description about the museum..."
                v-model="museumData.description"
                :class="errorObj.fields.includes('description') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"></textarea>
            <Loader v-if="pending" class="text-xl mx-auto" />
            <button v-else>
                Add
            </button>
        </form>
        <p v-if="errorObj.msg.length > 0" class="text-error text-center font-bold text-xl mt-1">{{ errorObj.msg }}</p>
        <p v-if="errorObj.succ.length > 0" class="text-lime-500 text-center font-bold text-xl mt-1">{{ errorObj.succ }}</p>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore';
const router = useRouter();
const userStore = useUserStore();
const config = useRuntimeConfig();
const museumData = ref({
    name: '',
    description: ''
})
const errorObj = ref<{
    fields: string[],
    msg: string,
    succ: string
}>({
    fields: [],
    msg: '',
    succ: ''
});
const pending = ref(false);

async function onSubmit() {
    if (pending.value || !userStore.user) return;
    errorObj.value.msg = "";
    errorObj.value.fields = [];
    errorObj.value.succ = "";
    pending.value = true;
    try {
        const { json, response } = await AuthFetch(`${config.public.apiBase}/v1/museum`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(museumData.value)
        })
        if (response.ok) {
            errorObj.value.succ = "Created!";
        } else {
            const rr = getZodError(json);
            if (rr) {
                errorObj.value.msg = rr.map(w => `${w.field}: ${w.message}`).join(', ');
            } else if (json && json.errors) {
                errorObj.value.msg = json.errors.join(', ');
            } else {
                errorObj.value.msg = "An error occurred!";
            }
        }
    } catch (rr: unknown) {
        console.error("Got an error");
        console.error(rr);
        if (rr instanceof Error) {
            errorObj.value.msg = rr.message;
        } else {
            errorObj.value.msg = "Failed to fetch";
        }
    } finally {
        pending.value = false;
    }
}

onMounted(() => {
    if (userStore.user && userStore.user.role !== 'ADMIN') {
        router.replace('/');
    }
})
</script>

<style scoped></style>