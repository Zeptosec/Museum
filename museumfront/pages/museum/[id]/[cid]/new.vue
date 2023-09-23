<template>
    <div class="mx-auto max-w-xl">
        <h1 class="text-2xl font-bold text-center">New item</h1>
        <form @submit.prevent="onSubmit" class="mt-4 text-lg grid gap-4">
            <input required type="text" name="name" v-model="itemData.name" placeholder="Title of the item"
                :class="errorObj.fields.includes('name') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''" />
            <textarea name="dsc" id="dsc" cols="30" rows="10" placeholder="Description about the item..."
                v-model="itemData.description"
                :class="errorObj.fields.includes('description') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"></textarea>
            <input v-on:change="onFileChange" type="file" id="img" name="img" accept="image/jpg, image/png, image/jpeg" />
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
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const config = useRuntimeConfig();
const itemData = ref({
    name: '',
    description: '',
    image: null
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
        const formdata = new FormData();
        if (itemData.value.image)
            formdata.append('image', itemData.value.image);
        formdata.append('description', itemData.value.description);
        formdata.append('title', itemData.value.name);
        const { json, response } = await AuthFetch(`${config.public.apiBase}/v1/items/${route.params.cid}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`,
            },
            body: formdata
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

function onFileChange(e: any) {
    var files = e.target.files || e.dataTransfer.files;
    if (!files.length) {
        itemData.value.image = null;
        return;
    }
    itemData.value.image = files[0];
}

onMounted(() => {
    if (!userStore.user || userStore.user.role !== 'ADMIN') {
        router.replace('/');
    }
})
</script>

<style scoped></style>