import { authService } from '../api/auth/auth.service.js'
import { asyncLocalStorage } from '../services/als.service.js'

export async function setupAsyncLocalStorage(req, res, next) {
    const storage = {}

    asyncLocalStorage.run(storage, () => {
        const tokenFromCookie = req.cookies?.loginToken
        const authHeader = req.get('Authorization') || ''
        const tokenFromHeader = authHeader.startsWith('Bearer ')
            ? authHeader.slice('Bearer '.length)
            : null
        const token = tokenFromCookie || tokenFromHeader
        if (!token) return next()
        const loggedinUser = authService.validateToken(token)

        if (loggedinUser) {
            const alsStore = asyncLocalStorage.getStore()
            alsStore.loggedinUser = loggedinUser
        }
        next()
    })
}
