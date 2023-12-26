// export default defineNuxtRouteMiddleware(to => {
//     // skip middleware on server
//     if (process.server) return
//     // skip middleware on client side entirely
//     if (process.client) return
//     // or only skip middleware on initial client load
//     const nuxtApp = useNuxtApp()
//     if (process.client && nuxtApp.isHydrating && nuxtApp.payload.serverRendered) return
//   })

export default defineEventHandler((event) => {
    //console.log('New request: ' + event.node.req.url)
})