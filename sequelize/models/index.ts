import {defineVideoModel, videoModelName, videoTableName} from "./videos.model"
import { Sequelize } from "sequelize"

type defineModel = typeof defineVideoModel

interface ModelItem {
    defineModel: defineModel,
    modelName: string,
    tableName: string
}

const modelsItems: ModelItem[] = [
    {
        defineModel: defineVideoModel,
        modelName: videoModelName,
        tableName: videoTableName
    }
]

export { modelsItems }
export type { ModelItem, defineModel }