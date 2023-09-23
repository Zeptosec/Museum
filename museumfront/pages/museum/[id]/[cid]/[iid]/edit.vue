<template>
    <ClientOnly>
        <div v-if="fetching.state">
            <p class="text-error text-center font-bold text-xl mt-1" v-if="fetching.error.length > 0">{{ fetching.error }}
            </p>
            <div v-else class="grid gap-4 justify-center">
                <p class="text-center text-xl">Loading</p>
                <Loader class="text-4xl mx-auto" />
            </div>
        </div>
        <div v-if="itemData" class="mx-auto max-w-xl">
            <h1 class="text-2xl font-bold text-center">Editing item {{ title }}</h1>
            <form @submit.prevent="onSubmit" class="mt-4 text-lg grid gap-4">
                <input required type="text" name="title" v-model="itemData.title" placeholder="Title of the category"
                    :class="errorObj.fields.includes('title') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''" />
                <textarea name="dsc" id="dsc" cols="30" rows="10" placeholder="Description about the category..."
                    v-model="itemData.description"
                    :class="errorObj.fields.includes('description') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"></textarea>
                <SearchSelect @searched="searchMuseum" :options="museumOptions" placeholder="Select a museum"
                    @changed="selectMuseum" :selected="itemData.Category.museum._selected" />
                <SearchSelect @searched="searchCategory" :options="categoryOptions" placeholder="Select a category"
                    @changed="selectCategory" :selected="itemData.Category._selected" />
                <input v-on:change="onFileChange" type="file" id="img" name="img"
                    accept="image/jpg, image/png, image/jpeg" />
                <NuxtImg v-if="itemData.imageUrl" :src="itemData.imageUrl"
                    class="rounded-xl max-h-[300px] object-cover w-full" />
                <Loader v-if="pending" class="text-xl mx-auto" />
                <button v-else>
                    Update
                </button>
            </form>
            <p ref="errorRef" v-if="errorObj.msg.length > 0" class="text-error text-center font-bold text-xl mt-1">{{
                errorObj.msg }}</p>
            <p ref="successRef" v-if="errorObj.succ.length > 0" class="text-lime-500 text-center font-bold text-xl mt-1">{{
                errorObj.succ }}
            </p>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { SearchOption } from '~/components/SearchSelect.vue';
import { useUserStore } from '~/stores/userStore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const config = useRuntimeConfig();
const errorRef = ref();
const successRef = ref();
const title = ref('');

const museumOptions = ref<SearchOption[]>([]);
const categoryOptions = ref<SearchOption[]>([]);


type EditingItemData = {
    id: number,
    title: string,
    description: string,
    imageUrl: string | undefined,
    image?: File,
    categoryId: number,
    Category: {
        id: number,
        createdAt: Date,
        name: string,
        description: string,
        museumId: number,
        imageUrl: string | undefined,
        museum: {
            id: number,
            name: string
            _selected: SearchOption
        },
        _selected: SearchOption
    }
}
const itemData = ref<EditingItemData | undefined>()
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
const fetching = ref({
    state: true,
    error: ''
});

function selectCategory(opt: SearchOption) {
    if (itemData.value)
        itemData.value.Category._selected = opt;
    console.log(opt);
}

function selectMuseum(opt: SearchOption) {
    if (itemData.value) {
        itemData.value.Category.museum._selected = opt;
        itemData.value.Category._selected = {
            text: '',
            id: -1
        }
        categoryOptions.value = []
    }
}

let abortContrl: AbortController | undefined;
async function searchMuseum(text: string) {
    if (abortContrl) abortContrl.abort();
    abortContrl = new AbortController()
    try {
        const { response, json } = await AuthFetch(`${config.public.apiBase}/v1/museums/search?name=${text}`, {
            headers: {
                'authorization': `Bearer ${userStore.user?.accessToken}`
            },
            signal: abortContrl.signal
        })
        if (response.ok) {
            museumOptions.value = json.museums.map((w: any) => ({ id: w.id, text: w.name }));
        } else {
            museumOptions.value = []
        }
    } catch (err) {
        console.error(err);
    }
}

let catAbortContrl: AbortController | undefined;
async function searchCategory(text: string) {
    if (catAbortContrl) catAbortContrl.abort();
    catAbortContrl = new AbortController();
    try {
        const { response, json } = await AuthFetch(`${config.public.apiBase}/v1/categories/search?name=${text}&museumId=${itemData.value?.Category.museum._selected.id}`, {
            headers: {
                'authorization': `Bearer ${userStore.user?.accessToken}`
            }
        })
        if (response.ok) {
            categoryOptions.value = json.categories.map((w: any) => ({ id: w.id, text: w.name }));
        } else {
            categoryOptions.value = []
        }
    } catch (err) {
        console.error(err);
    }
}

function onFileChange(e: any) {
    if (!itemData.value) return;
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
    itemData.value.imageUrl = URL.createObjectURL(files[0]) as any;
}

async function onSubmit() {
    if (pending.value || !userStore.user || !itemData.value) return;
    errorObj.value.msg = "";
    errorObj.value.fields = [];
    errorObj.value.succ = "";
    pending.value = true;
    try {
        const formdata = new FormData();
        if (itemData.value.image)
            formdata.append('image', itemData.value.image);
        formdata.append('description', itemData.value.description);
        formdata.append('title', itemData.value.title);
        formdata.append('newCategoryId', itemData.value.Category._selected.id.toString());
        const { json, response } = await AuthFetch(`${config.public.apiBase}/v1/items/${route.params.iid}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`,
            },
            body: formdata
        })
        if (response.ok) {
            errorObj.value.succ = "Updated!";
            title.value = json.item.title
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

onMounted(async () => {
    if (!userStore.user || userStore.user.role !== 'ADMIN') {
        return router.replace('/');
    }
    try {
        const rs = await fetch(`${config.public.apiBase}/v1/items/${route.params.cid}/${route.params.iid}`);
        const json = await rs.json();
        if (rs.ok) {
            fetching.value.state = false;
            itemData.value = json.item as EditingItemData;
            itemData.value.Category._selected = {
                id: itemData.value.Category.id,
                text: itemData.value.Category.name
            }
            itemData.value.Category.museum._selected = {
                id: itemData.value.Category.museum.id,
                text: itemData.value.Category.museum.name
            }
            title.value = itemData.value.title;
        } else {
            fetching.value.error = getError(json);
        }
    } catch (err) {
        console.error("Got an error");
        console.error(err);
        if (err instanceof Error) {
            fetching.value.error = err.message;
        } else {
            fetching.value.error = "Failed to fetch";
        }
    }
})
</script>

<style scoped></style>