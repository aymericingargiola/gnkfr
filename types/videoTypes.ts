type VideoBank = "Gaki no Tsukai"
type VideoTag = "Batsu Game" | "Kiki" | "Absolutely Tasty" | "Manzai" | "Silent Library"

interface Video {
    id?: string,
    bank?: VideoBank,
    fileName?: string,
    episode?: number,
    name?: string,
    description?: string,
    tag?: VideoTag,
    date?: Date,
    url?: string,
    otherUrls?: Array<string>,
    size?: string,
    duration?: number,
    ext?: string,
    private?: boolean,
    createdAt?: Date,
    updatedAt?: Date
}

export type { Video, VideoTag, VideoBank }