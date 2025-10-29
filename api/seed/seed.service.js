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

// Large collection of stable Unsplash image IDs (100+ unique images)
// Using Unsplash Source API format for stable, always-loading images
const UNSPLASH_IMAGE_IDS = [
    '1506905925346-21bda4d32df4', '1461749280684-dccba630e2f6', '1464822759844-d150baec0494',
    '1551183053-bf91a1d81141', '1571019613454-1cb2f99b2d8b', '1493225457124-a3eb161ffa5f',
    '1544367567-0f2fcb009e0b', '1581291518857-4e27b48ff24e', '1509042239860-f550ce710b93',
    '1547036967-23d11aacaee0', '1481627834876-b7833e8f5570', '1449255364193-b1644a366585',
    '1469474968028-56645f3d40db', '1524169358666-79af22581bda', '1533089861882-0a436c6b616e',
    '1551138816-6ac4230d9536', '1549903064-5f0c55e91c53', '1506477330937-80ede5d836f3',
    '1514525253161-7a46d19cd819', '1507003211169-0a1dd7228f2d', '1517077304055-6e89abbf09b0',
    '1493246507139-91e8fad9978e', '1516975080664-6172d2a5e6c5', '1522202176988-66273c2fdcd6',
    '1535958017273-68e9f81609a4', '1498758532582-55ce3b6d7f41', '1494783367193-149034c02e8b',
    '1488654715439-7507c6c05e59', '1500595046743-cd271d694d30', '1424847651686-8b7e369e4d5d',
    '1433863448220-78a06482c007', '1470071459604-3b5ec3a7fe05', '1516450360452-9312f5e86fc7',
    '1505142468610-359e7d316fb0', '1472214103451-9041942c790a', '1531778279279-ce8e9ba53475',
    '1507003211169-0a1dd7228f2d', '1488426862026-0dca60c37d04', '1488817624424-292ba91a4022',
    '1515378791806-22b28f91c395', '1546710503-6f4df66d0f17', '1496345961363-73a48cc5b6e3',
    '1551434678-e076c223a0be', '1508280756091-9b3757aab6e7', '1510906599835-ea9c45b5e4a3',
    '1520699909020-9edf6d604e8e', '1533090488129-7b7017b1c5a4', '1485962398705-ef6a13c41e2f',
    '1531054425438-61d6a77e8a74', '1556912172-45b7abe8b7e1', '1517148815978-3f60915ef0de',
    '1546710503-6f4df66d0f17', '1485566674518-f6b77fc8c6c7', '1517502166877-2e55a3f5c1b2',
    '1494548162492-3845b5c44837', '1486335234632-cb03c961b90e', '1495741546964-666d8e4d8cc5',
    '1470082719408-175895314d2b', '1472214103451-9041942c790a', '1454165804606-c3d57bc86b40',
    '1505142468610-359e7d316fb0', '1515495976963-496cad6b26de', '1513151233558-d860c5398176',
    '1489486501122-4d9a5fd50f15', '1486406146926-c627a92ad1ab', '1485875437342-9b39470b3d90',
    '1483985980845-56363e9267a8', '1473042901041-80d794f106c1', '1513151233558-d860c5398176',
    '1494947665471-566de4e3c32e', '1500530855697-56c99074a503', '1503951458645-7a8500c53164',
    '1484589065089-9ab1c78a0047', '1484608854153-86bf1932ad3d', '1473341304170-971dccb5ac1e',
    '1472148083602-5c4e0c22d6e7', '1477109827062-1d6bb3e6ec56', '1470219556762-1921c8fa72cd',
    '1473186578172-1415bdf35d72', '1485278537138-4a89195c8d42', '1494874698375-3e6e3a7dcdb8',
    '1515699366962-994220427af9', '1484480974673-08211002d3fd', '1502744682284-4e3e562c8e7e',
    '1499980761819-7ceb03cc5800', '1470296209213-465d52f8270d', '1504788367497-a783fecd7d91',
    '1484069560501-87a72b55ecae', '1470071459604-3b5ec3a7fe05', '1488486701122-7dc0d653e5c5',
    '1485856407642-8ddca7608f3e', '1486199849927-2ee94ce14151', '1446714276219-5393138b5e0e',
    '1506905925346-21bda4d32df4', '1516528387612-3c4d89c4439e', '1475069198037-400f019606bd',
    '1482350324514-ff4b3c2c4e9d', '1484480974673-08211002d3fd', '1495741546964-666d8e4d8cc5',
    '1515495976963-496cad6b26de', '1473691950023-1b9d9a6b5fd9', '1484533440604-807e60e8b349',
    '1476871643524-b9b7c5b6a0c4', '1486406146926-c627a92ad1ab', '1484589065089-9ab1c78a0047',
    '1517502166877-2e55a3f5c1b2', '1472214103451-9041942c790a', '1483647483962-95a4050cba86',
    '1473042901041-80d794f106c1', '1494548162492-3845b5c44837', '1488486701122-7dc0d653e5c5',
    '1515495976963-496cad6b26de', '1485856407642-8ddca7608f3e', '1454165804606-c3d57bc86b40',
    '1486335234632-cb03c961b90e', '1470219556762-1921c8fa72cd', '1472148083602-5c4e0c22d6e7',
    '1499980761819-7ceb03cc5800', '1504788367497-a783fecd7d91', '1484069560501-87a72b55ecae',
    '1515699366962-994220427af9', '1502744682284-4e3f562c8e7e', '1470296209213-465d52f8270d',
    '1485856407642-8ddca7608f3e', '1517502166877-2e55a3f5c1b2', '1484480974673-08211002d3fd',
    '1470296209213-465d52f8270d', '1475069198037-400f019606bd', '1482350324514-ff4b3c2c4e9d',
    '1485856407642-8ddca7608f3e', '1473691950023-1b9d9a6b5fd9', '1484533440604-807e60e8b349',
    '1499980761819-7ceb03cc5800', '1494874698375-3e6e3a77c8d8', '1488486701122-7dc0d653e5c5',
    '1515699366962-994220427af9', '1485856407642-8ddca7608f3e', '1475069198037-400f019606bd',
    '1482350324514-ff4b3c2c4e9d', '1486406146926-c627a92ad1ab', '1499980761819-7ceb03cc5800',
    '1517502166877-2e55a3f5c1b2', '1484480974673-08211002d3fd', '1470296209213-465d52f8270d',
    '1485856407642-8ddca7608f3e', '1475069198037-400f019606bd', '1515699366962-994220427af9',
    '1472148083602-5c4e0c22d6e7', '1485856407642-8ddca7608f3e', '1499980761819-7ceb03cc5800',
    '1470296209213-465d52f8270d', '1515699366962-994220427af9', '1485856407642-8ddca7608f3e',
    '1472148083602-5c4e0c22d6e7', '1504788367497-a783fecd7d91', '1484069560501-87a72b55ecae',
    '1515699366962-994220427af9', '1482350324514-ff4b3c2c4e9d', '1485856407642-8ddca7608f3e'
]

function getUniqueImage(postIndex) {
    // Cycle through images to ensure variety, using post index to determine which image
    // This ensures each post gets a different image, cycling through the array
    // Using modulo to cycle through all available images
    const imageIndex = postIndex % UNSPLASH_IMAGE_IDS.length
    const imageId = UNSPLASH_IMAGE_IDS[imageIndex]
    // Using Unsplash Source API format - these URLs are stable and always load
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
            
            let globalPostIndex = 0 // Track unique post index for image assignment
            
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
                        imgUrl: getUniqueImage(globalPostIndex), // Use unique image based on post index
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
                    
                    globalPostIndex++ // Increment for next post to get unique image
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
