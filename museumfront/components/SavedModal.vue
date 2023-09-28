<template>
    <div class="fixed flex bg-primary/40 w-screen items-center justify-center h-screen top-0 left-0" @click="emit('close')">
        <div class="relative sm:w-[500px] sm:h-[420px] bg-secondary text-center rounded-3xl">
            <div class="h-[200px] mt-7 mb-3">
                <img class="mx-auto max-h-[200px]" :src="props.src !== undefined ? props.src : '/images/check-icon.png'"
                    alt="check mark" />
            </div>
            <h6 class="text-4xl">{{ props.title }}</h6>
            <p class="text-lg my-4">{{ props.description }}</p>
            <button @click="emit('close')">Close</button>
            <div @click="emit('close')"
                class="close absolute right-4 top-4 cursor-pointer hover:text-tertiary transition-colors">
                <IconsCross />
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
const props = defineProps<{
    title: string,
    description: string,
    src?: string
}>();
const emit = defineEmits(['close']);
</script>

<style scoped></style>