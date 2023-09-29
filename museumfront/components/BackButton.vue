<template>
    <button @click="pushBack">
        Back To {{ props.title }}
    </button>
</template>

<script setup lang="ts">
const props = defineProps<{
    title: string,
    push: string
}>();
const route = useRoute();
const router = useRouter();
function pushBack() {
    const ind = route.path.indexOf(props.push);
    if (ind !== -1) {
        const newPath = route.path.slice(0, ind - 1);
        router.push({
            path: newPath
        });
    }
}
</script>

<style scoped></style>