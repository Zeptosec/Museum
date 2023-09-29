<template>
    <div ref="rootEl">
        <input v-model="searchVal" @focus="focused = true" @input="onSearchChanged" type="text" name="search" id="search"
            :placeholder="props.placeholder">
        <div v-if="focused">
            <div v-if="props.options.length > 0" class="bg-secondary grid overflow-y-auto rounded-xl p-3"
                :class="focused ? 'max-h-[200px]' : 'max-h-0'">
                <span v-for="item in props.options" :key="item.id" :value="item.id" @click="emit('changed', item)"
                    class="p-2 text-xl hover:cursor-pointer transition-colors border-b-primary border-b-2 last:border-none select-none"
                    :class="props.selected.findIndex(w => w.id === item.id) === -1 ? 'hover:bg-primary/30' : 'bg-tertiary/50'">{{
                        item.text
                    }}</span>
            </div>
            <p v-else="props.options.length === 0" class="text-center">Nothing found</p>
        </div>
        <div v-if="selected.length > 0" class="p-2 bg-secondary mt-4 rounded-lg">
            <div v-for="opt in selected" :key="opt.id"
                class="p-2 flex justify-between items-center hover:bg-primary/30 transition-colors group">
                <p>{{ opt.text }}</p>
                <IconsCross @click="emit('remove', opt)"
                    class="text-transparent hover:!text-tertiary group-hover:text-quaternary hover:cursor-pointer transition-colors" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const focused = ref(false);
const rootEl = ref();
export type SearchOption = {
    id: number,
    text: string
}
const props = defineProps<{
    options: SearchOption[],
    selected: SearchOption[],
    placeholder?: string
}>()
const searchVal = ref('')
watch(focused, (curr, prev) => {
    if (curr) {
        if (props.options.length === 0) {
            emit('searched', searchVal.value ? searchVal.value : '');
        }
    }
})

const emit = defineEmits<{
    searched: [text: string],
    changed: [id: SearchOption],
    remove: [opt: SearchOption]
}>()

let tmout: NodeJS.Timeout | undefined;
function onSearchChanged(e: Event) {
    if (e.target) {
        const target = e.target as HTMLInputElement;
        if (tmout) clearTimeout(tmout);
        tmout = setTimeout(() => emit('searched', target.value), 500);
    }
}

function clicked(event: Event) {
    if (!(rootEl.value === event.target || rootEl.value.contains(event.target))) {
        focused.value = false;
    }
}

onUnmounted(() => {
    document.body.removeEventListener('click', clicked);
})

onMounted(() => {
    document.body.addEventListener('click', clicked);
})


</script>

<style scoped></style>