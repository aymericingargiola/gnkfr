import * as fs from "fs"
import { v4 as uuidv4 } from 'uuid'
import path from "path"
import { load } from "cheerio"
import { jsonOrDefault, getDate, getPage, asyncForEach, formatBytes, getRootPath } from "../../helpers/utils"
import { getThumbnailsList, getVideoDatas, generateThumbnail } from "./ffmpeg"
import type { Video, VideoBank, VideoTag } from "../../types/videoTypes"
const rootPath = getRootPath()
const __jsonPath = path.join(rootPath, "sequelize/scripts/gnkfrvideos.json")

interface seedboxUrls {
    url: string,
    fileName: string,
    name: string,
    date: Date,
    tag: string,
    ext: string,
    episode: number
}

const gnkfr = {
    "name": "Gaki no Tsukai",
    "url": process.env.GNKFR_SCRAPURL
}

const getGnkfrVideos = async (): Promise<Video[]> => await jsonOrDefault(__jsonPath, [], true)

const updateGnkfrVideos = (datas: Video[]) => fs.writeFileSync(__jsonPath, JSON.stringify(datas))

const scrapGnkfrVideos = async (options?: {ignoreVideoDatas: boolean}) => {
    console.log(__jsonPath)
    console.time("Get Gnkfr videos")
    if (!gnkfr.url) {
        console.log("No url found for env variable GNKFR_SCRAPURL, skip.")
        console.timeEnd("Get Gnkfr videos")
        return false
    }
    try {
        const responsePage = await getPage(gnkfr.url)
        if (!responsePage) {
            console.timeEnd("Get Gnkfr videos")
            return false
        }
        const $sbx = load(responsePage)
        const existingThumbnails = await getThumbnailsList()
        const seedboxUrls: seedboxUrls[] = $sbx("a").map((i, a) => {
            if (i < 1) return null
            const url = $sbx(a).attr("href")
            if (!url) return null
            const [gnk, episode, day, tag, name] = url.split("_")
            const ext = url.split(".")[1]
            const item: seedboxUrls = {
                url: `${gnkfr.url}${url}`,
                fileName: decodeURI(url.split(".")[0]),
                name: decodeURI(name.split(".")[0]),
                date: getDate(day),
                tag: decodeURI(tag),
                episode: parseInt(episode),
                ext,
            }
            return item
        }).toArray().filter(el => el != null)
        const items = await getGnkfrVideos()
        await asyncForEach(seedboxUrls, async (item: seedboxUrls) => {
            let videoDatas
            const existingItemIndex: number = items.findIndex(e => e.name === item.name)
            const exitingItem: Video | undefined = items[existingItemIndex]
            const id: string = exitingItem?.id ? exitingItem.id : uuidv4()
            const fileName: string = item.fileName
            const bank: VideoBank = "Gaki no Tsukai"
            const name: string = item.name
            const tag: VideoTag = item.tag as VideoTag
            const episode: number = item.episode
            const url: string = item.url
            const otherUrls: Array<string> = []
            const ext: string = item.ext
            const date: Date = item.date
            let size: string | undefined = exitingItem?.size ? exitingItem.size : undefined
            let duration: number | undefined = exitingItem?.duration && exitingItem.duration > 0 ? exitingItem.duration : undefined
            console.log(`\n==== ${fileName} ====`)
            if (!options?.ignoreVideoDatas) {
                try {
                    console.log(`Fetching video datas for ${fileName} from ${url}...`)
                    videoDatas = await getVideoDatas(url)
                    console.log(`Video datas for ${fileName} found`)
                } catch (e) {
                    console.error(`Error while fetching video datas for ${fileName} from ${url} -> ${e}`)
                }
                if (videoDatas?.data?.format?.size) {
                    size = formatBytes(videoDatas.data.format.size)
                    console.log(`${fileName} is ${size}`)
                } else {
                    console.log(`Size not found in video datas for ${fileName}`)
                }
                if (videoDatas?.data?.streams && videoDatas?.data?.streams.length > 0) {
                    const videoStream = videoDatas.data.streams.find(s => s.codec_type === "video")
                    if (videoStream?.duration) {
                        duration = parseInt(videoStream.duration)
                        console.log(`${fileName} is ${duration} seconds`)
                    } else {
                        console.log(`Duration not found in video datas for ${fileName}`)
                    }
                }
            }
            if (!existingThumbnails.includes(`${fileName}.jpg`) && url && url !== "") {
                console.log(`generating video thumbnail of ${fileName} from ${url}...`)
                try {
                    await generateThumbnail(url, fileName)
                    console.log(`Video thumbnail for ${fileName} created.`)
                } catch (e) {
                    console.error(`Error while create video thumbnail for ${fileName}. -> ${e}`)
                }
            }
            if (exitingItem) {
                items[existingItemIndex] = {
                    ...items[existingItemIndex],
                    ...(bank && {bank: bank}),
                    ...(fileName && { fileName: fileName }),
                    ...(name && { name: name }),
                    ...(tag && { tag: tag }),
                    ...(episode && { episode: episode }),
                    ...(date && { date: date }),
                    ...(url && { url: url }),
                    ...(otherUrls && { otherUrls: otherUrls }),
                    ...(size && { size: size }),
                    ...(duration && { duration: duration }),
                    ...(ext && { ext: ext })
                }
            }
            else items.push({ id, bank, fileName, name, tag, episode, date, url, otherUrls, size, duration, ext })
        })
        console.log("Total videos:", items.length)
        updateGnkfrVideos(items)
        console.timeEnd("Get Gnkfr videos")
        return true
    } catch (error) {
        console.log(error)
        console.timeEnd("Get Gnkfr videos")
        return false
    }
}

export { gnkfr, scrapGnkfrVideos, getGnkfrVideos, updateGnkfrVideos }