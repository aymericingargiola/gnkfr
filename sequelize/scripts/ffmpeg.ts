import fsp from 'fs/promises'
import fs from 'fs'
import path from 'path'
import ffmpeg from "fluent-ffmpeg"
import ffmpegPath from "@ffmpeg-installer/ffmpeg"
import ffprobePath from "@ffprobe-installer/ffprobe"
import { getRootPath } from '../../helpers/utils'

ffmpeg.setFfmpegPath(ffmpegPath.path)
ffmpeg.setFfprobePath(ffprobePath.path)

const pathContext = process.env.ENV === "prod" ? "dynamic" : "dynamic"
const rootPath = getRootPath()

const tmpFolderBase = `/${pathContext}/images/thumbnails/tmp/`
const thumbnailFolderBase = `/${pathContext}/images/thumbnails/`
const clipFolderBase = `/${pathContext}/clips/`

const tmpFolder = path.join(rootPath, tmpFolderBase)
const thumbnailFolder = path.join(rootPath, thumbnailFolderBase)
const clipFolder = path.join(rootPath, clipFolderBase)

const paths = [tmpFolder, thumbnailFolder, clipFolder]

paths.forEach(path => {
    try {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
            console.log('Directory created:', path)
        }
    } catch (error) {
        console.log(error)
    }
})

const getThumbnailsList = async () => await fsp.readdir(thumbnailFolder)

const getVideoDatas = (videoPath: string) => new Promise<{ error?: string, data?: ffmpeg.FfprobeData }>((resolve, reject) => {
    ffmpeg(videoPath).ffprobe(0, (err: string, data) => {
        if (err) reject({ error: err })
        resolve({ data: data })
    })
})

const buildThumbnail = (videoPath: string, videoName: string, videoResolution: string, timestamps: number = 10) => new Promise<boolean>((resolve, reject) => {
    try {
        ffmpeg(videoPath).screenshot({
            timestamps: [`${timestamps}%`],
            filename: `${videoName}.jpg`,
            folder: tmpFolder,
            size: videoResolution,
        })
            .on("error", (e) => reject())
            .on("end", async (e) => {
                await fsp.rename(`${tmpFolder}${videoName}.jpg`, `${thumbnailFolder}${videoName}.jpg`)
                resolve(true)
            })
    } catch (err) {
        console.log(err)
        reject(false)
    }
})

const generateThumbnail = async (videoPath: string, videoName: string) => {
    const datas = await getVideoDatas(videoPath)
    if (datas.error) {
        console.error(datas.error)
        return false
    }
    const videoStream = datas?.data?.streams.find(s => s.codec_type === "video")
    if (!videoStream) {
        console.log("No video stream found")
        return false
    }
    let is169 = true
    let videoResolution = "320x240"
    const videoStreamHeight = videoStream.height
    const videoStreamWidth = videoStream.width
    if (videoStreamWidth && videoStreamHeight) {
        is169 = (videoStreamWidth > videoStreamHeight && videoStream.display_aspect_ratio === "16:9") || (videoStream.display_aspect_ratio === "40:71" && videoStreamWidth < videoStreamHeight) || (videoStream.display_aspect_ratio === "9:16" && videoStreamWidth < videoStreamHeight) || videoStreamWidth > videoStreamHeight
        videoResolution = `${Math.floor((is169 ? videoStreamWidth : videoStreamHeight) / 4)}x${Math.floor((is169 ? videoStreamHeight : videoStreamWidth) / 4)}`
    }
    const thumb = await buildThumbnail(videoPath, videoName, videoResolution)
    return thumb
}

const buildClip = (videoPath: string, videoName: string, start: number, duration: number, videoBitRate?: number, audioBitRate?: number) => new Promise<{ error?: string, url?: string }>((resolve, reject) => {
    try {
        console.log("build", videoPath, videoName, start, duration)
        ffmpeg(videoPath)
            .setStartTime(start)
            .setDuration(duration)
            .addOutputOption('-avoid_negative_ts make_zero')
            .withAudioCodec('copy')
            .withVideoCodec('copy')
            // .videoBitrate(videoBitRate)
            // .audioBitrate(audioBitRate)
            .on("start", (commandLine) => {
                console.log(`Build clip : ${commandLine}`)
            })
            .on("progress", (e) => {
                console.log("progress", e)
            })
            .on("error", (err) => {
                console.error("error: ", err)
                resolve({ error: err.message })
            })
            .on("end", async (err) => {
                if (!err) {
                    console.log("success building clip")
                    resolve({ url: `${clipFolderBase.replace(`/${pathContext}`, "")}${videoName}-${start}-${duration}.mp4` })
                } else {
                    console.error("end error:", err)
                    resolve({ error: err.message })
                }
            })
            .saveToFile(`${clipFolder}${videoName}-${start}-${duration}.mp4`)
    } catch (err) {
        console.error(err)
        resolve({ error: (err as Error).message })
    }
})

const generateClip = async (videoPath: string, videoName: string, startEntry: number, endEntry: number, force: boolean): Promise<{ error?: string, url?: string, name?: string }> => {
    const start = startEntry
    const end = endEntry
    const duration = end - start
    const existing = fs.existsSync(`${clipFolder}${videoName}-${start}-${duration}.mp4`)
    if (existing && !force) {
        console.log("clip already exist", `${clipFolderBase.replace(`/${pathContext}`, "")}${videoName}-${start}-${duration}.mp4`.replaceAll("\\", "/"))
        return { url: `${clipFolderBase.replace(`/${pathContext}`, "")}${videoName}-${start}-${duration}.mp4`, name: `${videoName}-${start}-${duration}.mp4` }
    }
    // const datas = await getDatas(videoPath)
    // const videoStream = datas?.streams.find(s => s.codec_type === "video")
    // const audioStream = datas?.streams.find(s => s.codec_type === "audio")
    const clip = await buildClip(videoPath, videoName, start, duration)
    return { ...clip, name: `${videoName}-${start}-${duration}.mp4` }
}

export { getThumbnailsList, getVideoDatas, generateThumbnail, generateClip }