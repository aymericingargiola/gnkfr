<script setup lang="ts">
import type { Video } from '@/types/videoTypes'

interface itemProps {
  video: Video
}

const props = defineProps<itemProps>()
</script>

<template>
    {{ video.fileName }}
</template>