import { seedService } from './seed.service.js'
import { logger } from '../../services/logger.service.js'

export async function seedDatabase(req, res) {
    try {
        const { token } = req.query
        
        // Protect with secret token from environment variable
        // If SEED_SECRET is not set, allow seeding (for initial setup)
        // Special token "seed-now" works if SEED_SECRET is not set
        // Otherwise require matching SEED_SECRET token
        const secretToken = process.env.SEED_SECRET
        
        // Allow seeding if no SEED_SECRET is set, or if token matches SEED_SECRET
        if (secretToken) {
            if (!token || token !== secretToken) {
                return res.status(401).json({ 
                    error: 'Unauthorized: Invalid seed token. Either remove SEED_SECRET env var or provide correct token.',
                    hint: 'Call with ?token=YOUR_SEED_SECRET_VALUE'
                })
            }
        }
        // If no SEED_SECRET set, allow seeding without token or with any token
        
        const result = await seedService.seedDatabase()
        logger.info('Database seeded successfully via API', result)
        res.json({ 
            success: true, 
            message: 'Database seeded successfully',
            users: result.usersCount,
            posts: result.postsCount,
            comments: result.commentsCount,
            likes: result.likesCount
        })
    } catch (err) {
        logger.error('Error seeding database via API', err)
        res.status(500).json({ error: 'Failed to seed database', details: err.message })
    }
}

