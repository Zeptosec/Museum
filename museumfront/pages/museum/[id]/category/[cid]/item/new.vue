<template>
    <div class="mx-auto max-w-xl pb-8">
        <h1 class="text-2xl font-bold text-center">New item</h1>
        <form @submit.prevent="onSubmit" class="mt-4 text-lg grid gap-4">
            <input required type="text" name="name" v-model="itemData.title" placeholder="Title of the item"
                :class="errorObj.fields.includes('name') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''" />
            <textarea name="dsc" id="dsc" cols="30" rows="10" placeholder="Description about the item..."
                v-model="itemData.description"
                :class="errorObj.fields.includes('description') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"></textarea>
            <input v-on:change="onFileChange" type="file" id="img" name="img" accept="image/jpg, image/png, image/jpeg" />
            <NuxtImg v-if="itemData.imageUrl" :src="itemData.imageUrl"
                class="rounded-xl max-h-[300px] object-cover w-full" />
            <Loader v-if="pending" class="text-xl mx-auto" />
            <button v-else>
                Add
            </button>
        </form>
        <p ref="errorRef" v-if="errorObj.msg.length > 0" class="text-error text-center font-bold text-xl mt-1">{{
            errorObj.msg }}</p>
        <p ref="successRef" v-if="errorObj.succ.length > 0" class="text-lime-500 text-center font-bold text-xl mt-1">{{
            errorObj.succ }}</p>
        <SavedModal v-if="showModal" @close="showModal = false" title="Created!"
            :description="`Item ${itemData.title} was created!`" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore';
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const errorRef = ref();
const successRef = ref();
const showModal = ref(false);
const config = useRuntimeConfig();

type CreateItemData = {
    title: string,
    description: string,
    imageUrl?: string,
    image?: File
}

const itemData = ref<CreateItemData>({
    title: '',
    description: '',
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
        const { json, response } = await AuthFetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${route.params.cid}/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                title: itemData.value.title,
                description: itemData.value.description
            })
        })
        if (response.ok) {
            if (itemData.value.image) {
                const formdata = new FormData();

                formdata.append('image', itemData.value.image);
                const rs = await AuthFetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${route.params.cid}/items/${json.item.id}/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userStore.user.accessToken}`,
                    },
                    body: formdata
                });
                if (!rs.response.ok) {
                    errorObj.value.msg = getError(rs.json)
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

function onFileChange(e: any) {
    var files = e.target.files || e.dataTransfer.files;
    if (!files.length) {
        itemData.value.image = undefined;
        return;
    }
    itemData.value.image = files[0];
    const imgUrl = itemData.value.imageUrl as string | undefined;
    if (imgUrl && imgUrl.startsWith('blob')) {
        URL.revokeObjectURL(imgUrl);
    }
    itemData.value.imageUrl = URL.createObjectURL(files[0]);
}

onMounted(() => {
    if (!userStore.user || !['ADMIN', 'CURATOR'].includes(userStore.user.role)) {
        router.replace('/');
    }
})
useHead({
    title: 'New item'
})
</script>

<style scoped></style>