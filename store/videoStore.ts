import type { Video } from '@/types/videoTypes'
import type { QueryVideo } from '@/types/queryTypes'
import type { ResponseDataVideos } from '@/types/serverTypes'
import { apiUrl, ApiRoutes } from '@/config/api'

export const useVideoStore = defineStore('auth', () => {
    const videos = ref<Video[]>([])
    const videosCount = ref<number>(0)

    async function searchVideos(query: QueryVideo): Promise<ResponseDataVideos> {
      const currentQuery: QueryVideo = { ...query }
      Object.keys(currentQuery).forEach(key => currentQuery[key as keyof QueryVideo] === undefined && delete currentQuery[key as keyof QueryVideo])
      try {
        // let queryString: string = "";
        // (Object.keys(currentQuery) as (keyof QueryVideo)[]).forEach((key) => {
        //     const query = currentQuery[key]
        //     if (query === undefined) return
        //     if (Array.isArray(query) && query.length > 0) return queryString += (queryString.length > 1 ? "&" : "") + new URLSearchParams(query.map(v => [key, v])).toString()
        //     if (typeof query === "string" && query.length > 0) return queryString += (queryString.length > 1 ? "&" : "") + key + "=" + currentQuery[key]
        //     if (typeof query === "number" && query > 0) return queryString += (queryString.length > 1 ? "&" : "") + key + "=" + currentQuery[key]
        // })
        const { data, pending, error, refresh } = await useFetch(ApiRoutes.SearchVideos, {
          method: 'get',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          query: { ...currentQuery }
        })
        const dataResp: ResponseDataVideos = data.value || {
          ...(process.client && (error?.value?.cause as any)?.data && { 
            ...(error?.value?.cause as any)?.data
          }),
          ...((process.server || (process.client && !(error?.value?.cause as any)?.data)) && { 
            error: {
              code: error?.value?.statusCode,
              message: error?.value?.message,
              serverError: error?.value?.cause
            } 
          }),
        }
        videos.value = dataResp?.result ?? []
        videosCount.value = dataResp?.count ?? 0
        return dataResp
      } catch (e) {
        console.error(`videoStore.searchVideos(${JSON.stringify(query)})`, e)
        const dataError: ResponseDataVideos = {
            error: {
                code: 500,
                message: `Erreur a la récupération des vidéos ${apiUrl(ApiRoutes.SearchVideos)}`,
                serverError: (e as Error)?.message
            }
        }
        return dataError
      }
    }

    const clipUrl = (name: string) => `${ApiRoutes.GetFiles}/${name}?base=clips`

    return { videos, videosCount, searchVideos, clipUrl }
  })