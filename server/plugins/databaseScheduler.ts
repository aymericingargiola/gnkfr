import { useScheduler } from "#scheduler"
import { checkDb } from "../../sequelize/database"
import { buildVideosItemsDb } from "../../sequelize/tasks/clean"
import { scrapGnkfrVideos } from "../../sequelize/scripts/gnkfr"

export default defineNitroPlugin(() => {
  startScheduler()
})

async function startScheduler() {
  const scheduler = useScheduler()
  await checkDb()
  await scrapGnkfrVideos()
  await buildVideosItemsDb()
  scheduler.run(async () => {
    await scrapGnkfrVideos()
    await buildVideosItemsDb()
  }).everyHours(1)
}