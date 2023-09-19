<template>
    <div>
       <button class="p-3">{{ props.choices[props.selected] }}</button>
       <div>
            <button v-for="(choice, ind) in props.choices" class="p-3" @click="select(choice)" :key="ind">{{ choice }}</button>
       </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
    choices: (string | number)[],
    selected: number
}>();

function select(choice: string | number){

}
</script>

<style scoped></style>