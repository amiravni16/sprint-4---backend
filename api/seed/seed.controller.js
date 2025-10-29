import { seedService } from './seed.service.js'
import { logger } from '../../services/logger.service.js'

export async function seedDatabase(req, res) {
    try {
        const { token } = req.query
        
        // Protect with secret token from environment variable
        // If SEED_SECRET is not set, allow seeding (for initial setup)
        // Otherwise require matching token
        const secretToken = process.env.SEED_SECRET
        
        if (secretToken && token !== secretToken) {
            return res.status(401).json({ error: 'Unauthorized: Invalid seed token. Set SEED_SECRET in environment variables or use token parameter.' })
        }
        
        const result = await seedService.seedDatabase()
        logger.info('Database seeded successfully via API', result)
        res.json({ 
            success: true, 
            message: 'Database seeded successfully',
            users: result.usersCount,
            posts: result.postsCount 
        })
    } catch (err) {
        logger.error('Error seeding database via API', err)
        res.status(500).json({ error: 'Failed to seed database', details: err.message })
    }
}

