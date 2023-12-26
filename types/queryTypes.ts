import type { VideoBank, VideoTag } from "./videoTypes"

type OrderQuery = [string, string]

interface Query {
    limit?: number,
    offset?: number,
    dateBegin?: Date,
    dateEnd?: Date,
    order?: OrderQuery
}

interface QueryVideo extends Query {
    videoId?: string,
    name?: string,
    description?: string,
    episode?: number,
    tags?: Array<VideoTag>,
    banks?: Array<VideoBank>
}

export type { Query, QueryVideo }