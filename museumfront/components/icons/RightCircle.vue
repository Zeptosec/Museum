<template>
    <i class="gg-arrow-right-o"></i>
</template>

<script setup></script>

<style scoped>
.gg-arrow-right-o {
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    border: 2px solid;
    transform: scale(var(--ggs, 1));
    border-radius: 20px
}

.gg-arrow-right-o::after,
.gg-arrow-right-o::before {
    content: "";
    display: block;
    box-sizing: border-box;
    position: absolute;
    right: 4px
}

.gg-arrow-right-o::after {
    width: 6px;
    height: 6px;
    border-top: 2px solid;
    border-right: 2px solid;
    transform: rotate(45deg);
    bottom: 6px
}

.gg-arrow-right-o::before {
    width: 10px;
    height: 2px;
    bottom: 8px;
    background: currentColor
}
</style>