interface ApiConfig {
    id: string,
    apiProtocol: string,
    apiHost: string,
    apiPort: string
}

// const apiConfigs: Array<ApiConfig> = [
//     {
//         id: "development",
//         apiProtocol: "http",
//         apiHost: "127.0.0.1",
//         apiPort: "3000"
//     },
//     {
//         id: "production",
//         apiProtocol: "https",
//         apiHost: "localhost",
//         apiPort: "3001"
//     }
// ]

const ApiRoutes = {
    SearchVideos: "/api/videos/search",
    GetFiles: "/api/files/"
}

//const getApiConfig = () => apiConfigs.find(c => c.id === import.meta.env.MODE)

//const apiUrl = (route: string) => `${getApiConfig()?.apiProtocol ?? 'http'}://${getApiConfig()?.apiHost ?? '127.0.0.1'}:${getApiConfig()?.apiPort ?? '3000'}${route}`

const apiUrl = (route: string) => {
    if (process.client) return route
    if (process.server) return `http://localhost:3000/${route}`
}

export { apiUrl, ApiRoutes }