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

// Cache for Pexels images to avoid hitting rate limits
let pexelsImageCache = null

/**
 * Fetch a collection of high-quality images from Pexels API
 * These URLs are stable and will always load
 */
async function fetchPexelsImages() {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY
    
    if (!PEXELS_API_KEY) {
        console.warn('⚠️ PEXELS_API_KEY not set, falling back to Picsum Photos')
        return null
    }
    
    // If cache exists, return it
    if (pexelsImageCache) {
        return pexelsImageCache
    }
    
    try {
        console.log('📷 Fetching images from Pexels API...')
        const images = []
        
        // Strategy: Fetch fewer requests with more images per request to stay within rate limits
        // Pexels free tier: ~200 requests/hour, 80 photos per page max
        // We'll do just 5-6 searches with max per_page to get 400-480 unique images
        
        const searchTerms = ['nature', 'city', 'travel', 'food', 'lifestyle', 'technology']
        const perPage = 80 // Maximum allowed per request
        
        for (const term of searchTerms) {
            try {
                // Fetch max photos per request to minimize API calls
                const response = await fetch(`https://api.pexels.com/v1/search?query=${term}&per_page=${perPage}&page=1`, {
                    headers: {
                        'Authorization': PEXELS_API_KEY
                    }
                })
                
                if (!response.ok) {
                    console.warn(`⚠️ Pexels API error for "${term}": ${response.status}`)
                    // If we hit rate limit or error, break early and use what we have
                    if (response.status === 429) {
                        console.warn('⚠️ Rate limit reached, using images fetched so far')
                        break
                    }
                    continue
                }
                
                const data = await response.json()
                if (data.photos && Array.isArray(data.photos)) {
                    // Extract medium-sized image URLs (stable URLs that always load)
                    data.photos.forEach(photo => {
                        if (photo.src && photo.src.medium) {
                            images.push(photo.src.medium) // Medium size (800x1200) perfect for Instagram posts
                        }
                    })
                }
                
                // Delay between requests to respect rate limits (200ms = ~5 requests/second, well within limits)
                await new Promise(resolve => setTimeout(resolve, 200))
                
                console.log(`✅ Fetched ${data.photos?.length || 0} images for "${term}" (total so far: ${images.length})`)
            } catch (err) {
                console.warn(`⚠️ Error fetching Pexels images for "${term}":`, err.message)
                // Continue with other searches even if one fails
            }
        }
        
        if (images.length === 0) {
            console.warn('⚠️ No Pexels images fetched, falling back to Picsum Photos')
            return null
        }
        
        console.log(`✅ Total fetched: ${images.length} unique Pexels images (will cycle through for all posts)`)
        pexelsImageCache = images
        return images
    } catch (err) {
        console.error('❌ Error fetching Pexels images:', err.message)
        return null
    }
}

/**
 * Get a unique image for each post
 * Uses Pexels if available, falls back to Picsum Photos
 */
async function getUniqueImage(postIndex, pexelsImages) {
    if (pexelsImages && pexelsImages.length > 0) {
        // Use Pexels images - cycle through them
        const imageIndex = postIndex % pexelsImages.length
        return pexelsImages[imageIndex]
    }
    
    // Fallback to Picsum Photos (always works)
    return `https://picsum.photos/seed/post-${postIndex}/800/800`
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
            
            // Fetch Pexels images before generating posts
            const pexelsImages = await fetchPexelsImages()
            
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
                        imgUrl: await getUniqueImage(globalPostIndex, pexelsImages), // Use unique image based on post index
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
