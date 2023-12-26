import { Sequelize, Op } from 'sequelize'
import type { ModelItem, defineModel } from './models/index.js'
import { modelsItems } from "./models/index.js"
import { asyncForEach } from '../helpers/utils.js'

type Models = {[key: string]: ReturnType<defineModel>}
const models: Models = {}

const connectString = `${process.env.DB_PROTOCOL}://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

const sequelize = new Sequelize(connectString, {
    logging: false,
})

const defineModels = async () => {
    await asyncForEach(modelsItems, async (model: ModelItem) => {
        const modelDefined = model.defineModel(sequelize)
        models[model.modelName] = modelDefined
    })
    await models.Video?.sync({ alter: true })
}

const connectToDb = async () => {
    try {
        await sequelize.authenticate()
        console.log('[connectToDb] DB Connection has been established successfully.')
        await defineModels()
        console.log('[connectToDb] DB models defined.')
        return true
    } catch (e) {
        console.error('[connectToDb] Unable to connect to the database:', (e as Error).message)
        return false
    }
}

const checkDb = async () => {
    if (Object.keys(models).length < 1) {
        console.log("[checkDb] No db models found, try to init...")
        await connectToDb()
        if (Object.keys(models).length < 1) {
            console.log("[checkDb] No db models found after init, skip.")
            return false
        }
    }
    return true
}

export { checkDb, models, sequelize, Sequelize, Op }