<template>
    <i class="gg-arrow-left-o"></i>
</template>

<script setup></script>

<style scoped>
.gg-arrow-left-o {
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    border: 2px solid;
    transform: scale(var(--ggs, 1));
    border-radius: 22px
}

.gg-arrow-left-o::after,
.gg-arrow-left-o::before {
    content: "";
    display: block;
    box-sizing: border-box;
    position: absolute;
    left: 4px
}

.gg-arrow-left-o::after {
    width: 6px;
    height: 6px;
    border-bottom: 2px solid;
    border-left: 2px solid;
    transform: rotate(45deg);
    bottom: 6px
}

.gg-arrow-left-o::before {
    width: 10px;
    height: 2px;
    bottom: 8px;
    background: currentColor
}
</style>