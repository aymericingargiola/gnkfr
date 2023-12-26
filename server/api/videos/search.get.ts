import type { ModelStatic, Model } from "sequelize"
import type { ResponseDataVideos } from "@/types/serverTypes"
import type { QueryVideo } from "@/types/queryTypes"
import type { Video } from "@/types/videoTypes"
import type { VideoAttributes } from "@/sequelize/models/videos.model"
import { models, Op } from "@/sequelize/database"

const searchVideos = async ({ offset, limit, dateBegin, dateEnd, order, name, description, episode, tags, videoId }: QueryVideo): Promise<ResponseDataVideos> => {
  const videos = await (models.Video as ModelStatic<Model<VideoAttributes, any>>).findAndCountAll({
    where: {
        ...(videoId && { id: videoId }),
        ...(name && { name: name }),
        ...(episode && { episode: episode }),
        ...(tags && { tag: Array.isArray(tags) ? { [Op.in]: tags } : tags}),
        ...((dateBegin || dateEnd) && {
            date: {
                ...((dateBegin && dateEnd) && { [Op.between]: [dateBegin, dateEnd] }),
                ...((dateBegin && !dateEnd) && { [Op.gte]: dateBegin }),
                ...((!dateBegin && dateEnd) && { [Op.lte]: dateEnd })
            }
        }),
    },
    order: [
        order ?? ['date', 'DESC']
    ],
    ...(offset && { offset: offset }),
    ...(limit && { limit: limit }),
    attributes: {
        exclude: ['updatedAt', 'createdAt']
    }
  })
  const response: ResponseDataVideos = {
      result: videos.rows as Video[],
      count: videos.count
  }
  return response
}

export default defineEventHandler(async (event) => {
  try {
    const query: QueryVideo = getQuery(event)
    const response = await searchVideos(query)
    setResponseStatus(event, 200)
    return response
  } catch (e) {
    //console.error(e)
    const response: ResponseDataVideos = {
      error: {
        code: 500,
        message: "Erreur serveur",
        serverError: (e as Error)?.message
      }
    }
    setResponseStatus(event, 500)
    return response
  }
})