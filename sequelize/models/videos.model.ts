
import type { Optional, ModelAttributes, Model } from "sequelize"
import type { Video } from "../../types/videoTypes"
import { DataTypes, Sequelize } from "sequelize"

const videoModelName = 'Video'
const videoTableName = 'Videos'

interface VideoAttributes extends Model, Video {}

const defineVideoModel = (sequelize: Sequelize) => {
    const model = sequelize.define(videoModelName, {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        bank: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        episode: {
            type: DataTypes.DECIMAL,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        otherUrls: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: true
        },
        size: {
            type: DataTypes.STRING,
            allowNull: true
        },
        duration: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        ext: {
            type: DataTypes.STRING,
            allowNull: true
        },
        private: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    }, {
        tableName: videoTableName
    })
    return model
}

export { defineVideoModel, videoModelName, videoTableName }
export type { VideoAttributes }