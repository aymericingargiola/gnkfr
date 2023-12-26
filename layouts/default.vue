
<template>
    <div>
        <header>
            <HeaderContainer />
        </header>
    </div>

    <UContainer class="container" :ui="{ constrained: '', padding: 'px-4 sm:px-4 lg:px-4'}">
        <slot />
    </UContainer>
</template>