<template>
    <div class="mx-auto max-w-xl">
        <h1 class="text-2xl font-bold text-center">New museum</h1>
        <form @submit.prevent="onSubmit" class="mt-4 text-lg grid gap-4">
            <input required type="text" name="name" v-model="museumData.name" placeholder="Name"
                :class="errorObj.fields.includes('name') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''" />
            <textarea name="dsc" id="dsc" cols="30" rows="10" placeholder="Description about the museum..."
                v-model="museumData.description"
                :class="errorObj.fields.includes('description') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"></textarea>
            <input v-on:change="onFileChange" type="file" id="img" name="img" accept="image/jpg, image/png, image/jpeg" />
            <Loader v-if="pending" class="text-xl mx-auto" />
            <button v-else>
                Create
            </button>

        </form>
        <p ref="errorRef" v-if="errorObj.msg.length > 0" class="text-error text-center font-bold text-xl mt-1">{{
            errorObj.msg }}</p>
        <p ref="successRef" v-if="errorObj.succ.length > 0" class="text-lime-500 text-center font-bold text-xl mt-1">{{
            errorObj.succ }}</p>
        <SavedModal v-if="showModal" @close="showModal = false" title="Created!"
            :description="`${museumData.name} was created and saved!`" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore';
const router = useRouter();
const userStore = useUserStore();
const config = useRuntimeConfig();
const errorRef = ref();
const successRef = ref();
const showModal = ref(false);
const museumData = ref({
    name: '',
    description: '',
    image: undefined
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

function onFileChange(e: any) {
    var files = e.target.files || e.dataTransfer.files;
    if (!files.length) {
        museumData.value.image = undefined;
        return;
    }
    museumData.value.image = files[0];
}

async function onSubmit() {
    if (pending.value || !userStore.user) return;
    errorObj.value.msg = "";
    errorObj.value.fields = [];
    errorObj.value.succ = "";
    pending.value = true;
    try {
        const { json, response } = await AuthFetch(`${config.public.apiBase}/v1/museums`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                description: museumData.value.description,
                name: museumData.value.name
            })
        })

        if (response.ok) {
            // for image upload
            if (museumData.value.image) {
                const formdata = new FormData();
                formdata.append('image', museumData.value.image);
                const { json: j, response: rs } = await AuthFetch(`${config.public.apiBase}/v1/museums/${json.museum.id}/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userStore.user.accessToken}`,
                    },
                    body: formdata
                });
                if (!rs.ok) {
                    const rr = getError(j);
                    errorObj.value.msg = rr;
                }
            }
            errorObj.value.succ = "Created!";
            showModal.value = true;
            nextTick(() => {
                if (successRef.value) {
                    successRef.value.scrollIntoView({ behaviour: 'smooth' });
                }
            })
        } else {
            const rr = getZodError(json);
            if (rr) {
                errorObj.value.msg = rr.map(w => `${w.field}: ${w.message}`).join(', ');
            } else if (json && json.errors) {
                errorObj.value.msg = json.errors.join(', ');
            } else {
                errorObj.value.msg = "An error occurred!";
            }
            nextTick(() => {
                if (errorRef.value) {
                    errorRef.value.scrollIntoView({ behaviour: 'smooth' });
                }
            })
        }
    } catch (rr: unknown) {
        console.error("Got an error");
        console.error(rr);
        if (rr instanceof Error) {
            errorObj.value.msg = rr.message;
        } else {
            errorObj.value.msg = "Failed to fetch";
        }
        nextTick(() => {
            if (errorRef.value) {
                errorRef.value.scrollIntoView({ behaviour: 'smooth' });
            }
        })
    } finally {
        pending.value = false;
    }
}

onMounted(() => {
    if (!userStore.user || userStore.user.role !== 'ADMIN') {
        router.replace('/');
    }
})
useHead({
    title: 'New museum'
})
</script>

<style scoped></style>