<template>
    <div>
        <input v-model="searchVal" @focus="focused = true" @blur="onBlur" @input="onSearchChanged" type="text" name="search"
            id="search" :placeholder="props.placeholder">
        <div v-if="focused">
            <div v-if="props.options.length > 0" class="bg-secondary grid overflow-y-auto rounded-xl p-3"
                :class="focused ? 'max-h-[200px]' : 'max-h-0'">
                <span v-for="(item, index) in props.options" :key="index" :value="item.id" @click="emit('changed', item)"
                    class="p-2 text-xl hover:bg-primary/30 hover:cursor-pointer transition-colors border-b-primary border-b-2 last:border-none">{{
                        item.text
                    }}</span>
            </div>
            <p v-else="props.options.length === 0" class="text-center">Nothing found</p>
        </div>

    </div>
</template>

<script setup lang="ts">
const focused = ref(false);
export type SearchOption = {
    id: number,
    text: string
}
const props = defineProps<{
    options: SearchOption[],
    selected: SearchOption | undefined,
    placeholder?: string
}>()
const searchVal = ref(props.selected?.text)
watch(focused, (curr, prev) => {
    if (!curr) {
        searchVal.value = props.selected?.text
    }
    if (curr) {
        if (props.options.length === 0) {
            emit('searched', searchVal.value ? searchVal.value : '');
        }
    }
})
const emit = defineEmits<{
    searched: [text: string],
    changed: [id: SearchOption]
}>()

let tmout: NodeJS.Timeout | undefined;
function onSearchChanged(e: Event) {
    if (e.target) {
        const target = e.target as HTMLInputElement;
        if (tmout) clearTimeout(tmout);
        tmout = setTimeout(() => emit('searched', target.value), 500);
    }
}

function onBlur() {
    setTimeout(() => focused.value = false, 100)
}
</script>

<style scoped></style>