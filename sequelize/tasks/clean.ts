import type { Video, VideoBank } from "../../types/videoTypes"
import { models } from "../database"
import { asyncForEach } from "../../helpers/utils"
import { gnkfr, getGnkfrVideos } from "../scripts/gnkfr"
import type { Model, ModelCtor, ModelStatic } from "sequelize"
import type { VideoAttributes } from "../models/videos.model"

const checkFields = (videoJson: Video, videoDb: Video, bank: VideoBank) => {
    return {
        ...(videoJson.bank !== videoDb.bank && { bank: videoJson.bank }),
        ...(videoJson.name !== videoDb.name && { name: videoJson.name }),
        ...(videoJson.tag !== videoDb.tag && { tag: videoJson.tag }),
        ...(videoJson.episode && videoDb.episode && +videoJson.episode !== +videoDb.episode && { episode: +videoJson.episode }),
        ...(videoJson.date && videoDb.date && new Date(videoJson.date).getTime() !== new Date(videoDb.date).getTime() && { date: videoJson.date }),
        ...(videoJson.url !== videoDb.url && { url: videoJson.url }),
        ...(JSON.stringify(videoJson.otherUrls) !== JSON.stringify(videoDb.otherUrls) && { otherUrls: videoJson.otherUrls }),
        ...(videoJson.size !== videoDb.size && { size: videoJson.size }),
        ...(videoJson.duration !== videoDb.duration && { duration: videoJson.duration }),
        ...(videoJson.ext !== videoDb.ext && { ext: videoJson.ext })
    }
}

const cleanUpVideosItemsDb = async (videos: Video[], bank: VideoBank) => {
    console.time("[cleanUpVideosItemsDb] Clean videos db")
    try {
        const VideosDb = await (models.Video as ModelStatic<Model<VideoAttributes, any>>).findAll({
            where: {
                bank: bank
            }
        })
        const deletedVideos = VideosDb.filter((v) => videos.findIndex(vid => vid.id === v?.dataValues?.id) === -1)
        if (deletedVideos.length > 0) {
            const itemsToRemove = deletedVideos.map((v) => v.dataValues.id).filter((item): item is string => !!item)
            console.log("[cleanUpVideosItemsDb] Remove", deletedVideos.map((v: any) => v.dataValues.fileName).join(", "))
            await (models.Video as ModelStatic<Model<VideoAttributes, any>>).destroy({ where: { id: itemsToRemove }})
        }
    } catch (e) {
        console.timeEnd("[cleanUpVideosItemsDb] Clean videos db")
        return false
    }
    console.timeEnd("[cleanUpVideosItemsDb] Clean videos db")
    return true
}

const buildVideosItemsDb = async (bank: VideoBank = "Gaki no Tsukai") => {
    console.time("[buildVideosItemsDb] Fill videos db")
    if (!models?.Video) {
        console.log("[buildVideosItemsDb] Video model not found, skip.")
        console.timeEnd("[buildVideosItemsDb] Fill videos db")
        return true
    }
    let videosJson: Video[] = []
    switch (bank) {
        case "Gaki no Tsukai":
            videosJson = await getGnkfrVideos()
            break;
    }
    if (videosJson.length < 1) {
        console.log("[buildVideosItemsDb] No video found")
        console.timeEnd("[buildVideosItemsDb] Fill videos db")
        return true
    }
    await asyncForEach(videosJson, async (video: Video) => {
        try {
            const existingVideoDb: Model<VideoAttributes, any> | null = await (models.Video as ModelStatic<Model<VideoAttributes, any>>).findOne({
                where: {
                    fileName: video.fileName
                }
            })
            if (existingVideoDb) {
                const updateFields = checkFields(video, existingVideoDb.dataValues, bank)
                if (updateFields && Object.keys(updateFields).length > 0) {
                    console.log(updateFields)
                    await existingVideoDb.update(updateFields)
                }
            }
            else {
                const createVideoDbItem = await (models.Video as ModelStatic<Model<VideoAttributes, any>>).create({
                    bank: bank,
                    ...video
                })
            }
        }
        catch (e) {
            console.log(e)
            return false
        }
    })
    console.timeEnd("[buildVideosItemsDb] Fill videos db")
    await cleanUpVideosItemsDb(videosJson, bank)
    return true
}

export { buildVideosItemsDb }