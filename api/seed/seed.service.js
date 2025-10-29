import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'

// Helper functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Realistic names and usernames
const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Sam', 'Drew', 'Blake', 'Cameron', 'Jamie', 'Dakota', 'Emery', 'Finley', 'Harper', 'Hayden', 'Jaden', 'Kai', 'Logan', 'Noah', 'River', 'Rowan', 'Sage', 'Skylar', 'Sloane', 'Tatum', 'Phoenix', 'Reese', 'Sage', 'Quinn', 'Ari', 'Asher', 'Ellis', 'Emery', 'Everett', 'Graham', 'Hollis', 'Jules', 'Kiran', 'Lake', 'Lane', 'Levi', 'Marlowe', 'Micah', 'Ocean', 'Remy', 'Rory', 'Sage']

const LAST_NAMES = ['Anderson', 'Martinez', 'Thompson', 'Garcia', 'Davis', 'Rodriguez', 'Wilson', 'Brown', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson']

const INTERESTS = [
    { emoji: '📸', name: 'Photography', bios: ['Capturing life\'s moments', 'Photographer | Visual storyteller', 'Camera enthusiast'] },
    { emoji: '✈️', name: 'Travel', bios: ['Exploring the world', 'Travel blogger', 'Adventure seeker'] },
    { emoji: '🍝', name: 'Food', bios: ['Foodie at heart', 'Chef | Cooking enthusiast', 'Restaurant explorer'] },
    { emoji: '💪', name: 'Fitness', bios: ['Fitness trainer', 'Gym enthusiast', 'Health & wellness'] },
    { emoji: '🎨', name: 'Art', bios: ['Artist | Creator', 'Digital artist', 'Art enthusiast'] },
    { emoji: '🎵', name: 'Music', bios: ['Music producer', 'DJ | Musician', 'Music lover'] },
    { emoji: '🧘', name: 'Yoga', bios: ['Yoga instructor', 'Mindfulness practitioner', 'Wellness advocate'] },
    { emoji: '📚', name: 'Books', bios: ['Bookworm', 'Literary enthusiast', 'Reading addict'] },
    { emoji: '🛹', name: 'Skateboarding', bios: ['Skateboarder', 'Street style', 'Skate culture'] },
    { emoji: '☕', name: 'Coffee', bios: ['Coffee enthusiast', 'Barista', 'Coffee shop lover'] },
    { emoji: '🏔️', name: 'Outdoor', bios: ['Outdoor adventurer', 'Nature lover', 'Hiking enthusiast'] },
    { emoji: '🎬', name: 'Film', bios: ['Filmmaker', 'Cinema lover', 'Video creator'] },
    { emoji: '💻', name: 'Tech', bios: ['Developer | Coder', 'Tech enthusiast', 'Digital creator'] },
    { emoji: '🏃', name: 'Running', bios: ['Marathon runner', 'Running enthusiast', 'Fitness runner'] },
    { emoji: '🌿', name: 'Nature', bios: ['Nature photographer', 'Plant enthusiast', 'Outdoor explorer'] },
    { emoji: '🎮', name: 'Gaming', bios: ['Gamer', 'Esports enthusiast', 'Gaming streamer'] },
    { emoji: '🏋️', name: 'Gym', bios: ['Gym rat', 'Powerlifter', 'Bodybuilder'] },
    { emoji: '🎭', name: 'Theater', bios: ['Actor | Performer', 'Theater enthusiast', 'Drama lover'] },
    { emoji: '🎪', name: 'Circus', bios: ['Circus performer', 'Acrobat', 'Entertainer'] },
    { emoji: '🎯', name: 'Archery', bios: ['Archer', 'Bow hunter', 'Target practice'] }
]

const POST_TEXT_TEMPLATES = [
    'Beautiful {time} vibes! 🌅',
    'Just finished {activity}, feeling amazing! 💪',
    'New {subject} today, can\'t wait to share more! ✨',
    'Life is about {concept}. Enjoy every moment! 🎉',
    'Working on something exciting! Stay tuned 📸',
    'Coffee and {activity} - perfect combination ☕',
    'Exploring new places! {location} is amazing 🌍',
    'Weekend vibes! {activity} with friends 🎊',
    'Fresh {subject} for you today! Hope you enjoy 🌟',
    'Nature never fails to amaze me! {location} 📷',
    'Behind the scenes of {activity} 🎬',
    'Quick {subject} update - loving this journey! 💫',
    'Sunset at {location} is everything! 🌅',
    'New {subject} project incoming! Watch this space 🚀',
    'Sometimes the simple moments are the best ones ✨',
    'Adventures in {location}! What a day 🌈',
    'Creative mode: ON 🎨 {subject}',
    'Morning routine: {activity} before the day begins ☀️',
    'Weekend project: {subject} update 🛠️',
    'Living my best life! {activity} makes me happy 😊'
]

const COMMENT_TEXT_TEMPLATES = [
    'Love this! 🔥',
    'Amazing! 😍',
    'So beautiful! 🌟',
    'This is incredible! 💯',
    'Wow! ❤️',
    'Stunning! ✨',
    'Perfect! 👌',
    'Love it! 💕',
    'This is everything! 🎉',
    'So good! 🙌',
    'Beautiful work! 📸',
    'Inspiration right here! 💡',
    'Absolutely gorgeous! 🌈',
    'This made my day! 😊',
    'Incredible capture! 🎯',
    'Love the vibes! ✨',
    'This is art! 🎨',
    'So inspiring! 💪',
    'Perfect composition! 📷',
    'This is goals! 🚀'
]

const UNSPLASH_IMAGE_IDS = [
    '1506905925346-21bda4d32df4', '1461749280684-dccba630e2f6', '1464822759844-d150baec0494',
    '1551183053-bf91a1d81141', '1571019613454-1cb2f99b2d8b', '1493225457124-a3eb161ffa5f',
    '1544367567-0f2fcb009e0b', '1581291518857-4e27b48ff24e', '1509042239860-f550ce710b93',
    '1547036967-23d11aacaee0', '1481627834876-b7833e8f5570', '1571019613454-1cb2f99b2d8b',
    '1506905925346-21bda4d32df4', '1461749280684-dccba630e2f6', '1464822759844-d150baec0494',
    '1551183053-bf91a1d81141', '1571019613454-1cb2f99b2d8b', '1493225457124-a3eb161ffa5f',
    '1544367567-0f2fcb009e0b', '1581291518857-4e27b48ff24e', '1509042239860-f550ce710b93',
    '1547036967-23d11aacaee0', '1481627834876-b7833e8f5570', '1449255364193-b1644a366585',
    '1469474968028-56645f3d40db', '1524169358666-79af22581bda', '1533089861882-0a436c6b616e',
    '1551138816-6ac4230d9536', '1549903064-5f0c55e91c53', '1547036967-23d11aacaee0',
    '1506477330937-80ede5d836f3', '1547036967-23d11aacaee0', '1481627834876-b7833e8f5570',
    '1581291518857-4e27b48ff24e', '1544367567-0f2fcb009e0b', '1493225457124-a3eb161ffa5f',
    '1464822759844-d150baec0494', '1461749280684-dccba630e2f6', '1506905925346-21bda4d32df4'
]

function getRandomImage() {
    const imageId = randomChoice(UNSPLASH_IMAGE_IDS)
    return `https://images.unsplash.com/photo-${imageId}?w=800&h=800&fit=crop&crop=center`
}

export const seedService = {
    async seedDatabase() {
        try {
            console.log('🌱 Starting database seeding...')
            
            // Connect to database
            await dbService.connect()
            const db = dbService.getDb()
            
            // Clear existing collections
            console.log('🗑️ Clearing existing data...')
            await db.collection('user').deleteMany({})
            await db.collection('post').deleteMany({})
            
            // Generate users
            console.log('👥 Generating 100 users...')
            const users = []
            const userIds = []
            
            // Add amir.avni first
            const amirId = new ObjectId('64f0a1c2b3d4e5f678901234')
            const amirPassword = await bcrypt.hash('admin', 10)
            users.push({
                _id: amirId,
                username: 'amir.avni',
                fullname: 'Amir Avni',
                imgUrl: 'https://i.pravatar.cc/150?img=50',
                password: amirPassword,
                isAdmin: true,
                followers: [],
                following: [],
                savedPosts: [],
                bio: 'Fullstack Developer 🚀'
            })
            userIds.push(amirId.toString())
            
            // Generate 99 more users
            const usedUsernames = new Set(['amir.avni'])
            const usedFullnames = new Set(['Amir Avni'])
            
            for (let i = 1; i <= 99; i++) {
                let username, fullname
                do {
                    const firstName = randomChoice(FIRST_NAMES)
                    const lastName = randomChoice(LAST_NAMES)
                    fullname = `${firstName} ${lastName}`
                    const interest = randomChoice(INTERESTS)
                    username = `${firstName.toLowerCase()}_${interest.name.toLowerCase().replace(/\s+/g, '')}`
                } while (usedUsernames.has(username) || usedFullnames.has(fullname))
                
                usedUsernames.add(username)
                usedFullnames.add(fullname)
                
                const interest = randomChoice(INTERESTS)
                const userId = `user${i}`
                userIds.push(userId)
                
                users.push({
                    _id: userId,
                    username,
                    fullname,
                    imgUrl: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
                    password: await bcrypt.hash('demo123', 10),
                    isAdmin: false,
                    followers: [],
                    following: [],
                    savedPosts: [],
                    bio: `${interest.emoji} ${randomChoice(interest.bios)}`
                })
            }
            
            // Generate follow relationships (each user follows 10-30 random users)
            console.log('🔗 Generating follow relationships...')
            for (let i = 0; i < users.length; i++) {
                const user = users[i]
                const numFollowing = randomInt(10, 30)
                const following = shuffleArray(userIds.filter(id => id !== (user._id.toString ? user._id.toString() : user._id))).slice(0, numFollowing)
                user.following = following
                
                // Add this user to followers of the users they're following
                following.forEach(followedId => {
                    const followedUser = users.find(u => (u._id.toString ? u._id.toString() : u._id) === followedId)
                    if (followedUser) {
                        if (!followedUser.followers) followedUser.followers = []
                        const userId = user._id.toString ? user._id.toString() : user._id
                        if (!followedUser.followers.includes(userId)) {
                            followedUser.followers.push(userId)
                        }
                    }
                })
            }
            
            // Insert users
            console.log('💾 Inserting users...')
            await db.collection('user').insertMany(users)
            
            // Generate posts (at least 9 per user = 900+ posts)
            console.log('📸 Generating posts (at least 9 per user)...')
            const posts = []
            const activities = ['coding', 'photography', 'hiking', 'cooking', 'working out', 'traveling', 'creating', 'exploring', 'designing', 'building']
            const subjects = ['project', 'photo', 'artwork', 'design', 'creation', 'work', 'adventure', 'journey']
            const concepts = ['the journey', 'experiences', 'making memories', 'living fully']
            const locations = ['the mountains', 'the beach', 'the city', 'nature', 'this place']
            const times = ['morning', 'afternoon', 'evening', 'sunset', 'sunrise']
            
            for (const user of users) {
                const postsPerUser = randomInt(9, 12) // 9-12 posts per user
                const userId = user._id.toString ? user._id.toString() : user._id
                
                for (let i = 0; i < postsPerUser; i++) {
                    const template = randomChoice(POST_TEXT_TEMPLATES)
                    let txt = template
                        .replace('{time}', randomChoice(times))
                        .replace('{activity}', randomChoice(activities))
                        .replace('{subject}', randomChoice(subjects))
                        .replace('{concept}', randomChoice(concepts))
                        .replace('{location}', randomChoice(locations))
                    
                    // 30% chance to add more text
                    if (Math.random() < 0.3) {
                        txt += ' ' + randomChoice(['Can\'t believe how amazing this is!', 'So grateful for this moment.', 'Life is beautiful!', 'What a day!', 'Feeling blessed!'])
                    }
                    
                    // Generate likes (random up to 99, but not from the post owner)
                    const numLikes = randomInt(0, 99)
                    const availableUsers = userIds.filter(id => id !== userId)
                    const likedBy = shuffleArray(availableUsers).slice(0, numLikes)
                    
                    // Generate comments (10-20 per post)
                    const numComments = randomInt(10, 20)
                    const comments = []
                    const commenters = shuffleArray(availableUsers).slice(0, Math.min(numComments, availableUsers.length))
                    
                    for (let j = 0; j < numComments; j++) {
                        const commenterId = commenters[j % commenters.length]
                        const commenter = users.find(u => (u._id.toString ? u._id.toString() : u._id) === commenterId)
                        
                        if (commenter) {
                            const commentLikes = randomInt(0, 10)
                            const commentLikers = shuffleArray(availableUsers.filter(id => id !== commenterId && id !== userId)).slice(0, commentLikes)
                            
                            comments.push({
                                id: `comment_${userId}_${i}_${j}`,
                                by: {
                                    _id: commenterId,
                                    fullname: commenter.fullname,
                                    username: commenter.username,
                                    imgUrl: commenter.imgUrl
                                },
                                txt: randomChoice(COMMENT_TEXT_TEMPLATES),
                                createdAt: Date.now() - randomInt(1000, 2592000000), // Within last 30 days
                                likedBy: commentLikers
                            })
                        }
                    }
                    
                    posts.push({
                        txt,
                        imgUrl: getRandomImage(),
                        tags: [randomChoice(['nature', 'photography', 'travel', 'food', 'fitness', 'art', 'lifestyle', 'adventure']), 
                               randomChoice(['beautiful', 'amazing', 'inspiring', 'awesome', 'stunning']),
                               randomChoice(['love', 'life', 'happy', 'grateful', 'blessed'])],
                        by: {
                            _id: userId,
                            fullname: user.fullname,
                            username: user.username,
                            imgUrl: user.imgUrl
                        },
                        likedBy,
                        comments,
                        createdAt: Date.now() - randomInt(1000, 2592000000) // Within last 30 days
                    })
                }
            }
            
            // Insert posts in batches for better performance
            console.log('💾 Inserting posts (this may take a moment)...')
            const batchSize = 100
            for (let i = 0; i < posts.length; i += batchSize) {
                const batch = posts.slice(i, i + batchSize)
                await db.collection('post').insertMany(batch)
                console.log(`   Inserted ${Math.min(i + batchSize, posts.length)} / ${posts.length} posts...`)
            }
            
            const usersCount = users.length
            const postsCount = posts.length
            const commentsCount = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
            const likesCount = posts.reduce((sum, post) => sum + (post.likedBy?.length || 0), 0)
            
            console.log('✅ Database seeded successfully!')
            console.log(`   👥 Users: ${usersCount}`)
            console.log(`   📸 Posts: ${postsCount}`)
            console.log(`   💬 Comments: ${commentsCount}`)
            console.log(`   ❤️ Total Likes: ${likesCount}`)
            
            return {
                usersCount,
                postsCount,
                commentsCount,
                likesCount,
                message: 'Database seeded successfully'
            }
        } catch (err) {
            console.error('❌ Error seeding database:', err)
            throw err
        }
    }
}
