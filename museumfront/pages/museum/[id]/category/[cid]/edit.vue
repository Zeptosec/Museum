<template>
    <div v-if="fetching.state">
        <p class="text-error text-center font-bold text-xl mt-1" v-if="fetching.error.length > 0">{{ fetching.error }}
        </p>
        <div v-else class="grid gap-4 justify-center">
            <p class="text-center text-xl">Loading</p>
            <Loader class="text-4xl mx-auto" />
        </div>
    </div>
    <div v-else class="mx-auto max-w-xl pb-8">
        <h1 class="text-2xl font-bold text-center">Editing category {{ title }}</h1>
        <form @submit.prevent="onSubmit" class="mt-4 text-lg grid gap-4">
            <input required type="text" name="name" v-model="categoryData.name" placeholder="Title of the category"
                :class="errorObj.fields.includes('name') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''" />
            <textarea name="dsc" id="dsc" cols="30" rows="10" placeholder="Description about the category..."
                v-model="categoryData.description"
                :class="errorObj.fields.includes('description') ? 'ring-2 ring-error focus:ring-error focus:ring-2' : ''"></textarea>
            <SearchSelect @searched="searchChanged" :options="options" placeholder="Select a museum"
                @changed="selectedOption" :selected="categoryData.museum" />
            <input v-on:change="onFileChange" type="file" id="img" name="img" accept="image/jpg, image/png, image/jpeg" />
            <NuxtImg v-if="categoryData.imageUrl" :src="categoryData.imageUrl"
                class="rounded-xl max-h-[300px] object-cover w-full" />
            <p class="text-center text-xl">Control who can edit</p>
            <SearchSelectMultiple @searched="usersSearched" :options="userOptions" placeholder="someuser@gmail.com"
                :selected="editUsers" @changed="userSelected" @remove="userRemove" />
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
        <SavedModal v-if="showModal" @close="showModal = false" title="Updated!"
            :description="`Category data was updated!`" />
    </div>
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
const showModal = ref(false);
const options = ref<SearchOption[]>([])

const userOptions = ref<SearchOption[]>([]);
const editUsers = ref<SearchOption[]>([]);

let abortUserSearch: AbortController | undefined;
async function usersSearched(text: string) {
    if (abortUserSearch) abortUserSearch.abort();
    abortUserSearch = new AbortController()
    try {
        const { response, json } = await AuthFetch(`${config.public.apiBase}/v1/admin/users?email=${text}&role=CURATOR`, {
            headers: {
                'authorization': `Bearer ${userStore.user?.accessToken}`,
            },
            signal: abortUserSearch.signal
        })
        if (response.ok) {
            userOptions.value = json.users.map((w: any) => ({ id: w.id, text: w.email }));
        } else {
            userOptions.value = []
        }
    } catch (err) {
        console.error(err);
    }
}

async function userRemove(opt: SearchOption) {
    if (!editUsers.value.find(w => w.id === opt.id) || !userStore.user) return;
    // remove user from the list
    editUsers.value = editUsers.value.filter(w => w.id !== opt.id);
    let failed = false;
    try {
        const { response, json } = await AuthFetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${route.params.cid}/removeuser/${opt.id}`, {
            method: 'DELETE',
            headers: {
                'authorization': `Bearer ${userStore.user.accessToken}`,
            },
        });
        if (!response.ok) {
            alert(getError(json));
            failed = true;
        }
    } catch (err) {
        console.log(err);
        failed = true;
        alert(getError(err));
    }
    if (failed) {
        // add user back if failed
        editUsers.value.push(opt);
    }
}

async function userSelected(opt: SearchOption) {
    if (editUsers.value.find(w => w.id === opt.id) || !userStore.user) return;
    editUsers.value.push(opt);
    let failed = false;
    try {
        const { response, json } = await AuthFetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${route.params.cid}/adduser`, {
            method: 'POST',
            headers: {
                'authorization': `Bearer ${userStore.user.accessToken}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                id: opt.id
            })
        });
        if (!response.ok) {
            alert(getError(json));
            failed = true;
        }
    } catch (err) {
        console.log(err);
        failed = true;
        alert(getError(err));
    }
    if (failed) {
        editUsers.value = editUsers.value.filter(w => w.id !== opt.id);
    }
}

const categoryData = ref({
    name: '',
    description: '',
    image: undefined,
    museum: {
        id: -1,
        text: ''
    },
    imageUrl: undefined,
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

function selectedOption(opt: SearchOption) {
    categoryData.value.museum = opt;
}

let abortContrl: AbortController | undefined;
async function searchChanged(text: string) {
    if (abortContrl) abortContrl.abort();
    abortContrl = new AbortController()
    try {
        const { response, json } = await AuthFetch(`${config.public.apiBase}/v1/museums/search?name=${text}`, {
            headers: {
                'authorization': `Bearer ${userStore.user?.accessToken}`,
            },
            signal: abortContrl.signal
        })
        if (response.ok) {
            options.value = json.museums.map((w: any) => ({ id: w.id, text: w.name }));
        } else {
            options.value = []
        }
    } catch (err) {
        console.error(err);
    }
}

function onFileChange(e: any) {
    var files = e.target.files || e.dataTransfer.files;
    if (!files.length) {
        categoryData.value.image = undefined;
        return;
    }
    categoryData.value.image = files[0];
    const imgUrl = categoryData.value.imageUrl as string | undefined;
    if (imgUrl && imgUrl.startsWith('blob')) {
        URL.revokeObjectURL(imgUrl);
    }
    categoryData.value.imageUrl = URL.createObjectURL(files[0]) as any;
}

async function onSubmit() {
    if (pending.value || !userStore.user) return;
    errorObj.value.msg = "";
    errorObj.value.fields = [];
    errorObj.value.succ = "";
    pending.value = true;
    try {
        const { json, response } = await AuthFetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${route.params.cid}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${userStore.user.accessToken}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                description: categoryData.value.description,
                name: categoryData.value.name,
                museumId: categoryData.value.museum.id
            })
        })
        if (response.ok) {
            if (categoryData.value.image) {
                const formdata = new FormData();
                formdata.append('image', categoryData.value.image);
                const rs = await AuthFetch(`${config.public.apiBase}/v1/museums/${json.category.museumId}/categories/${json.category.id}/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userStore.user.accessToken}`,
                    },
                    body: formdata
                })
                if (!rs.response.ok) {
                    errorObj.value.msg = getError(rs.json);
                }
            }
            errorObj.value.succ = "Updated!";
            router.push({
                path: `/museum/${json.category.museumId}/category/${json.category.id}/edit`
            })
            showModal.value = true;
            title.value = json.category.name;
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
        const rs = await fetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${route.params.cid}`);
        const json = await rs.json();
        if (rs.ok) {
            fetching.value.state = false;
            categoryData.value = json.category;
            categoryData.value.museum = {
                text: json.category.museum.name,
                id: json.category.museumId
            }
            title.value = json.category.name;
            const rs2 = await AuthFetch(`${config.public.apiBase}/v1/museums/${route.params.id}/categories/${route.params.cid}/users`, {
                headers: {
                    'authorization': `Bearer ${userStore.user.accessToken}`
                }
            })
            if (rs2.response.ok) {
                editUsers.value = rs2.json.users.map((w: any) => ({ id: w.id, text: w.email }));
            }
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
useHead({
    title: 'Edit category'
})
</script>

<style scoped></style>