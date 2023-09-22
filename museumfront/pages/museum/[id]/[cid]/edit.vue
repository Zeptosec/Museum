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
        <div v-else class="mx-auto max-w-xl">
            <h1 class="text-2xl font-bold text-center">Editing category {{ title }}</h1>
            <form @submit.prevent="onSubmit" class="mt-4 text-lg grid gap-4">
                <input required type="text" name="name" v-model="categoryData.name" placeholder="Title of the category"
                    :class="errorObj.fields.includes('name') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''" />
                <textarea name="dsc" id="dsc" cols="30" rows="10" placeholder="Description about the category..."
                    v-model="categoryData.description"
                    :class="errorObj.fields.includes('description') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"></textarea>
                <v-select v-model="selected" :options="cities" :reduce="(item: any) => item.id"
                    @option:selected="(city: any) => onSelected(city)" @option:deselected="(city: any) => onDeselected(city)"
                    label="name"></v-select>
                <input v-on:change="onFileChange" type="file" id="img" name="img"
                    accept="image/jpg, image/png, image/jpeg" />
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
import { useUserStore } from '~/stores/userStore';


const selected = ref('');
const cities = ref([
    { id: 1, name: 'city 1', region: 'region A' },
    { id: 2, name: 'city 2', region: 'region A' },
    { id: 3, name: 'city 3', region: 'region B' },
    { id: 4, name: 'city 4', region: 'region C' },
    { id: 5, name: 'city 5', region: 'region D' },
])

function onSelected(opt: any) {
    console.log(opt);
}

function onDeselected(opt: any) {
    console.log(opt);
}

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const config = useRuntimeConfig();
const errorRef = ref();
const successRef = ref();
const title = ref('');
const categoryData = ref({
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
const fetching = ref({
    state: true,
    error: ''
});

const options = ref([
    'foo',
    'bar',
    'baz'
]);

function onFileChange(e: any) {
    var files = e.target.files || e.dataTransfer.files;
    if (!files.length) {
        categoryData.value.image = undefined;
        return;
    }
    categoryData.value.image = files[0];
}

async function onSubmit() {
    if (pending.value || !userStore.user) return;
    errorObj.value.msg = "";
    errorObj.value.fields = [];
    errorObj.value.succ = "";
    pending.value = true;
    try {
        const formdata = new FormData();
        if (categoryData.value.image)
            formdata.append('image', categoryData.value.image);
        formdata.append('description', categoryData.value.description);
        formdata.append('name', categoryData.value.name);
        const { json, response } = await AuthFetch(`${config.public.apiBase}/v1/categories/${route.params.cid}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`,
            },
            body: formdata
        })
        if (response.ok) {
            errorObj.value.succ = "Updated!";
            title.value = json.category.name
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
        const rs = await fetch(`${config.public.apiBase}/v1/categories/${route.params.id}/${route.params.cid}`);
        const json = await rs.json();
        if (rs.ok) {
            fetching.value.state = false;
            categoryData.value = json.category;
            title.value = json.category.name;
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