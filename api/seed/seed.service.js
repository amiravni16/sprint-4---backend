import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'

// Instagram demo data (same as scripts/seed.js)
const DEMO_USERS = [
    {
        _id: new ObjectId('64f0a1c2b3d4e5f678901234'),
        username: 'amir.avni',
        fullname: 'Amir Avni',
        imgUrl: 'https://i.pravatar.cc/150?img=50',
        password: '$2b$10$XKQJvKdKqXKQJvKdKqXKQO.vKdKdKdKdKdKdKdKdKdKdKdKdKdK',
        isAdmin: true,
        followers: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
        following: ['user1', 'user2', 'user3', 'user4', 'user5'],
        savedPosts: [],
        bio: 'Fullstack Developer 🚀'
    },
    {
        _id: 'user1',
        username: 'sarah_photography',
        fullname: 'Sarah Johnson',
        imgUrl: 'https://i.pravatar.cc/150?img=1',
        password: '$2b$10$XKQJvKdKqXKQJvKdKqXKQO.vKdKdKdKdKdKdKdKdKdKdKdK',
        isAdmin: false,
        followers: ['64f0a1c2b3d4e5f678901234', 'user2', 'user3'],
        following: ['64f0a1c2b3d4e5f678901234', 'user2', 'user3'],
        savedPosts: [],
        bio: '📸 Photographer | Capturing life\'s beautiful moments'
    },
    {
        _id: 'user2',
        username: 'mike_travels',
        fullname: 'Mike Chen',
        imgUrl: 'https://i.pravatar.cc/150?img=2',
        password: '$2b$10$XKQJvKdKqXKQJvKdKqXKQO.vKdKdKdKdKdKdKdK',
        isAdmin: false,
        followers: ['64f0a1c2b3d4e5f678901234', 'user1', 'user4'],
        following: ['64f0a1c2b3d4e5f678901234', 'user1', 'user4'],
        savedPosts: [],
        bio: '✈️ Travel Enthusiast | Explore the world'
    },
    {
        _id: 'user3',
        username: 'emma_foodie',
        fullname: 'Emma Rodriguez',
        imgUrl: 'https://i.pravatar.cc/150?img=3',
        password: '$2b$10$XKQJvKdKqXKQJvKdKqXKQO.vKdKdKdKdKdK',
        isAdmin: false,
        followers: ['64f0a1c2b3d4e5f678901234', 'user1', 'user5'],
        following: ['64f0a1c2b3d4e5f678901234', 'user1', 'user5'],
        savedPosts: [],
        bio: '🍝 Food Blogger | Italian cuisine lover'
    },
    {
        _id: 'user4',
        username: 'alex_fitness',
        fullname: 'Alex Thompson',
        imgUrl: 'https://i.pravatar.cc/150?img=4',
        password: '$2b$10$XKQJvKdKqXKQJvKdKqXKQO.vKdKdKdKdKdK',
        isAdmin: false,
        followers: ['64f0a1c2b3d4e5f678901234', 'user2', 'user5'],
        following: ['64f0a1c2b3d4e5f678901234', 'user2', 'user5'],
        savedPosts: [],
        bio: '💪 Fitness Trainer | Transform your body'
    },
    {
        _id: 'user5',
        username: 'luna_art',
        fullname: 'Luna Martinez',
        imgUrl: 'https://i.pravatar.cc/150?img=5',
        password: '$2b$10$XKQJvKdKqXKQJvKdKqXKQO.vKdKdKdKdK',
        isAdmin: false,
        followers: ['64f0a1c2b3d4e5f678901234', 'user3', 'user4'],
        following: ['64f0a1c2b3d4e5f678901234', 'user3', 'user4'],
        savedPosts: [],
        bio: '🎨 Artist | Creating magic with colors'
    },
    {
        _id: 'user6',
        username: 'test_follower',
        fullname: 'Test Follower',
        imgUrl: 'https://i.pravatar.cc/150?img=6',
        password: '$2b$10$XKQJvKdKqXKQJvKdKqXKQO.vKdKdKdKdK',
        isAdmin: false,
        followers: ['user1', 'user2'],
        following: ['64f0a1c2b3d4e5f678901234'],
        savedPosts: []
    }
]

const DEMO_POSTS = [
    {
        txt: 'Beautiful sunset at the beach! 🌅',
        imgUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
        tags: ['sunset', 'beach', 'nature'],
        by: {
            _id: 'user1',
            fullname: 'Sarah Johnson',
            username: 'sarah_photography',
            imgUrl: 'https://i.pravatar.cc/150?img=1'
        },
        likedBy: ['64f0a1c2b3d4e5f678901234', 'user2'],
        comments: [
            {
                id: 'comment1',
                by: { 
                    _id: '64f0a1c2b3d4e5f678901234',
                    fullname: 'Amir Avni',
                    username: 'amir.avni',
                    imgUrl: 'https://i.pravatar.cc/150?img=50'
                },
                txt: 'Amazing shot! 📸',
                createdAt: Date.now() - 1800000,
                likedBy: ['user1']
            }
        ],
        createdAt: Date.now() - 3600000
    },
    {
        txt: 'Coffee and coding ☕️💻',
        imgUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop&crop=center',
        tags: ['coffee', 'coding', 'work'],
        by: {
            _id: '64f0a1c2b3d4e5f678901234',
            fullname: 'Amir Avni',
            username: 'amir.avni',
            imgUrl: 'https://i.pravatar.cc/150?img=50'
        },
        likedBy: ['user1', 'user3'],
        comments: [],
        createdAt: Date.now() - 7200000
    },
    {
        txt: 'Exploring the mountains today! 🏔️',
        imgUrl: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=400&h=400&fit=crop&crop=center',
        tags: ['mountains', 'hiking', 'adventure'],
        by: {
            _id: 'user2',
            fullname: 'Mike Chen',
            username: 'mike_travels',
            imgUrl: 'https://i.pravatar.cc/150?img=2'
        },
        likedBy: ['64f0a1c2b3d4e5f678901234', 'user1', 'user4'],
        comments: [
            {
                id: 'comment2',
                by: {
                    _id: 'user1',
                    fullname: 'Sarah Johnson',
                    username: 'sarah_photography',
                    imgUrl: 'https://i.pravatar.cc/150?img=1'
                },
                txt: 'Looks incredible!',
                createdAt: Date.now() - 900000,
                likedBy: ['64f0a1c2b3d4e5f678901234', 'user2', 'user4']
            }
        ],
        createdAt: Date.now() - 10800000
    },
    {
        txt: 'Homemade pasta for dinner 🍝',
        imgUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop&crop=center',
        tags: ['food', 'cooking', 'pasta'],
        by: {
            _id: 'user3',
            fullname: 'Emma Rodriguez',
            username: 'emma_foodie',
            imgUrl: 'https://i.pravatar.cc/150?img=3'
        },
        likedBy: ['64f0a1c2b3d4e5f678901234', 'user2'],
        comments: [],
        createdAt: Date.now() - 14400000
    },
    {
        txt: 'Morning workout complete! 💪',
        imgUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
        tags: ['fitness', 'workout', 'morning'],
        by: {
            _id: 'user4',
            fullname: 'Alex Thompson',
            username: 'alex_fitness',
            imgUrl: 'https://i.pravatar.cc/150?img=4'
        },
        likedBy: ['64f0a1c2b3d4e5f678901234', 'user1', 'user3', 'user5'],
        comments: [],
        createdAt: Date.now() - 18000000
    }
]

export const seedService = {
    async seedDatabase() {
        try {
            // Hash password for amir.avni
            const saltRounds = 10
            const hashedPassword = await bcrypt.hash('admin', saltRounds)
            
            // Replace fake password with real hash in first user
            const usersToInsert = DEMO_USERS.map(user => {
                if (user.username === 'amir.avni') {
                    return { ...user, password: hashedPassword }
                }
                return user
            })
            
            // Connect to database
            await dbService.connect()
            const db = dbService.getDb()
            
            // Clear existing collections
            await db.collection('user').deleteMany({})
            await db.collection('post').deleteMany({})
            
            // Insert users
            await db.collection('user').insertMany(usersToInsert)
            const usersCount = usersToInsert.length
            
            // Insert posts
            await db.collection('post').insertMany(DEMO_POSTS)
            const postsCount = DEMO_POSTS.length
            
            return {
                usersCount,
                postsCount,
                message: 'Database seeded successfully'
            }
        } catch (err) {
            throw err
        }
    }
}

