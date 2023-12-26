<script setup lang="ts">
import type { ResponseDataVideos } from '@/types/serverTypes'
import { useVideoStore } from '@/store/videoStore'

const videoStore = useVideoStore()

const searchVideos: ResponseDataVideos = await videoStore.searchVideos({tags: ['Kiki', 'Absolutely Tasty']})

if (process.client) console.log(searchVideos)
</script>

<template>
    {{ searchVideos }}
    <ul>
        <li v-for="video in searchVideos?.result" :key="video.id">
            <VideoListItem :video="video"/>
        </li>
    </ul>
</template>