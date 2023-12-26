<script setup lang="ts">
import type { Video } from '@/types/videoTypes'

interface playerProps {
  video: Video,
  startAt: number,
  stopAt: number,
  noAmbiant: boolean
}

const props = defineProps<playerProps>()

const emits = defineEmits(["timeupdate", "videoelement"])

const videoEl = ref<HTMLVideoElement>()
const videoElBg = ref<HTMLVideoElement>()
const videoDuration = ref<number | null>(null)

function onLoadedMetadatas(e: Event) {
  const eventVideoEl = e.target as HTMLVideoElement
  if (!videoEl) return
  videoDuration.value = eventVideoEl.duration
  if (props.startAt) eventVideoEl.currentTime = props.startAt
  if (!props.noAmbiant && videoElBg.value?.src && videoElBg.value.src !== eventVideoEl.currentSrc) {
    videoElBg.value.src = eventVideoEl.currentSrc
    videoElBg.value?.load()
  }
  //console.log(e, e.duration, e.target.duration, videoDuration)
}

onMounted(() => {
  if (videoEl.value) {
    emits("videoelement", videoEl.value)
    videoEl.value.addEventListener("timeupdate", (e) => {
      const eventVideoEl = e.target as HTMLVideoElement
      emits("timeupdate", eventVideoEl.currentTime)
      if (!props.noAmbiant && videoElBg.value && videoElBg.value.currentTime !== eventVideoEl.currentTime) {
        videoElBg.value.currentTime = eventVideoEl.currentTime
      }
      if (props.stopAt && props.stopAt <= eventVideoEl.currentTime) {
        eventVideoEl.pause()
        if (!props.noAmbiant) videoElBg.value?.pause()
      }
    })
    if (!props.noAmbiant) {
      videoEl.value.addEventListener("play", (e) => {
      videoElBg.value?.play()
    })
    videoEl.value.addEventListener("pause", (e) => {
      videoElBg.value?.pause()
    })
    }
  }
})

</script>

<template>
  <div class="video-player">
    <div class="video-container">
      <video v-if="!noAmbiant" class="video-bg" ref="videoElBg" muted></video>
      <video ref="videoEl" @loadedmetadata="(e) => onLoadedMetadatas(e)" controls controlslist="nodownload"
        preload="metadata">
        <source v-for="source in video.otherUrls" :src="source" :type="`video/mp4`" />
        <source :src="video.url" :type="`video/${video.ext ?? 'mp4'}`" />
      </video>
    </div>
  </div>
</template>
