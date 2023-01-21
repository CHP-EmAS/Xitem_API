import { Request, Response, NextFunction } from "express"

class LogHandler {
    public static async requestLogger(request: Request, response: Response, next: NextFunction) {

        let url: string;
        if(request.originalUrl.length > 200) {
            url = request.originalUrl.substring(0,197) + "..."
        } else {
            url = request.originalUrl
        }

        const timeStamp: string = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

        switch(request.method) {
            case "GET":
                console.log("[" + timeStamp + "]🔵 GET    " + url)
                break
            case "POST":
                console.log("[" + timeStamp + "]🟢 POST   " + url)
                break
            case "PATCH":
                console.log("[" + timeStamp + "]🟡 PATCH  " + url)
                break
            case "PUT":
                console.log("[" + timeStamp + "]🟠 PUT    " + url)
                break
            case "DELETE":
                console.log("[" + timeStamp + "]🔴 DELETE " + url)
                break
            default:
                console.log("[" + timeStamp + "]⚪ " + request.method + " " + url)
                break
        }

        next()
    }
}

export default LogHandler
