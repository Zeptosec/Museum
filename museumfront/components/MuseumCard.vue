<template>
    <div class="relative bg-secondary rounded-xl group max-w-xl mx-auto w-full overflow-hidden glow">
        <NuxtLink v-if="edit" :to="`/museum/${props.museum.id}/edit`"
            class="absolute top-3 right-10 w-6 h-6 flex justify-center items-center">
            <IconsPen />
        </NuxtLink>
        <span v-if="edit" @click="infoDel = !infoDel"
            class="absolute top-3 right-3 hover:text-tertiary transition-colors cursor-pointer text-xl">
            <IconsCross />
        </span>
        <div v-if="edit"
            class="absolute flex items-center justify-between transition-all ease-in-out w-full h-12 bg-secondary"
            :class="infoDel ? `top-0` : `-top-12`">
            <button @click="emit('remove', props.museum.id)" class="bg-error !rounded-none">DELETE</button>
            <p class="px-3 text-error font-bold text-center">delete {{ props.museum.name }}?</p>
            <button @click="infoDel = false" class="!rounded-none">CANCEL</button>
        </div>
        <NuxtLink :to="props.url ? props.url : `/museum/${props.museum.id}`">
            <NuxtImg loading="lazy" class="rounded-t-xl h-[300px] object-cover w-full" v-if="props.museum.imageUrl"
                :src="props.museum.imageUrl" />
        </NuxtLink>
        <div class="p-3">
            <NuxtLink :to="props.url ? props.url : `/museum/${props.museum.id}`"
                class="p-1 text-2xl font-bold group-hover:text-tertiary transition-colors">{{ props.museum.name }}
            </NuxtLink>
            <p class="p-1 mt-1 text-lg border-t-2 border-primary group-hover:border-tertiary transition-colors">{{
                props.museum.description }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { MuseumData } from '~/pages/index.vue';

const infoDel = ref(false);
const emit = defineEmits<{
    remove: [id: number]
}>()
const props = defineProps<{
    museum: MuseumData,
    edit: boolean,
    url?: string
}>()
</script>