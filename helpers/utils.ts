import * as fs from "fs"
import path from "path"
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(process.env.METAURL ?? import.meta.url)
const __dirname = path.dirname(__filename)

const asyncForEach = async (array: Array<any> | Object, callback: Function) => {
    const getType = (obj: typeof array) => Object.prototype.toString.call(obj).slice(8, -1)
    const isMap = (obj: typeof array) => getType(obj) === 'Map'
    if (isMap(array)) {
        let index = 0
        for (const key in array) {
            await callback(array[key as keyof Object], index, array)
            ++index
        }
    } else {
        for (let index = 0; index < (array as Array<any>).length; index++) {
            await callback((array as Array<any>)[index], index, array)
        }
    }
}

const jsonOrDefault = async (filePath: string, defaultDatas = {}, create = false) => {
    try {
        if (!fs.existsSync(filePath) && !create) return defaultDatas
        else if (!fs.existsSync(filePath) && create) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
            fs.writeFileSync(filePath, JSON.stringify(defaultDatas))
        }
        const file = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(file)
    } catch (e) {
        console.log('[helpers/utils/jsonOrDefault]', e)
        return defaultDatas
    }
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`
}

const getDate = (day: string, hour: string = "000000") => {
    const checkHour = hour.length === 6 ? hour : hour.length < 6 ? hour + '0'.repeat(6 - hour.length) : hour.length > 6 ? hour.slice(0, 6) : "000000"
    const newDay = day ? day.match(/(\d{4})(\d{2})(\d{2})/)?.slice(1).join('/') : "s"
    const newHour = checkHour ? checkHour.match(/(\d{2})(\d{2})(\d{2})/)?.slice(1).join(':') : ""
    const [y, m, d] = newDay ? newDay.split('/') : ["0", "1", "0"]
    const [h, min, sec] = newHour ? newHour?.split(':') : ["0", "0", "0"]
    const date = new Date()
    date.setUTCFullYear(+y)
    date.setUTCMonth(+m - 1)
    date.setUTCDate(+d)
    date.setUTCHours(+h)
    date.setUTCMinutes(+min)
    date.setUTCSeconds(+sec)
    date.setUTCMilliseconds(0)
    return date
}

const getPage = async (url: string, settings = {}) => {
    try {
        const response = await fetch(url, settings)
        if (response.status !== 200) {
            console.log(`[getPage] Failed to load page ${url}, status code ${response.status}`, response.statusText)
            return false
        }
        return await response.text()
    } catch (error) {
        console.error(`[getPage] Fail to load page ${url}`, error)
        return false
    }
}

const getRootPath = (): string => path.join(__dirname, process.env.ENV === 'local' ? "../../" : "")



export { asyncForEach, jsonOrDefault, formatBytes, getDate, getPage, getRootPath }