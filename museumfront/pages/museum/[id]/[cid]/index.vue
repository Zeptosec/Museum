<template>
    <div>
        {{ route.params.id }} {{ route.params.cid }}
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>

<style scoped>

</style>