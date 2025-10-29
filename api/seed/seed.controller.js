import { seedService } from './seed.service.js'
import { logger } from '../../services/logger.service.js'

export async function seedDatabase(req, res) {
    try {
        const { token } = req.query
        
        // Protect with secret token from environment variable
        const secretToken = process.env.SEED_SECRET || 'default-seed-token-change-me'
        
        if (token !== secretToken) {
            return res.status(401).json({ error: 'Unauthorized: Invalid seed token' })
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

