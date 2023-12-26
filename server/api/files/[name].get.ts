// /server/routes/file/[name].get.js
import fs from "fs"
import path from "path"
import { getRootPath } from "@/helpers/utils";
import type { ResponseGetFile, ResponseDataError } from "@/types/serverTypes";

const rootPath = getRootPath()

export default defineEventHandler(async (event): Promise<ResponseGetFile> => {
  try {
    const query: {base: string} = getQuery(event)
    const params = event.context.params
    if (!query.base || !params?.name) {
      const response: {error: ResponseDataError} = {
        error: {
          code: 500,
          message: "Paramètre manquant pour obtenir le fichier",
          serverError: `Missing params -> base: ${query.base} | name: ${params?.name}`
        }
      }
      setResponseStatus(event, 500)
      return response
    }
    const filePath = path.join(rootPath, "dynamic/", query.base, params.name)
    console.log(filePath)
    if (!fs.existsSync(filePath)) {
      const response: {error: ResponseDataError} = {
        error: {
          code: 500,
          message: "Le fichier n'existe pas",
          serverError: "File doesn't exist"
        }
      }
      setResponseStatus(event, 500)
      return response
    }
    setResponseStatus(event, 200)
    return sendStream(event, fs.createReadStream(filePath))
  } catch (e) {
    const response: {error: ResponseDataError} = {
      error: {
        code: 500,
        message: "Erreur serveur",
        serverError: (e as Error)?.message
      }
    }
    setResponseStatus(event, 500)
    return response
  }
});