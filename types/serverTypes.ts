import type { Video } from "@/types/videoTypes"
import type internal from "stream"

interface ResponseDataError {
    code: number,
    message: string,
    serverError: string
}

interface ResponseData {
    error?: ResponseDataError,
    result?: Array<object>,
    count?: number
}

interface ResponseDataVideos extends ResponseData {
    result?: Array<Video>
}

type ResponseGetFile = Promise<void> | {error: ResponseDataError}

export type { ResponseDataError, ResponseData, ResponseDataVideos, ResponseGetFile }