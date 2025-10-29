import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
    add, // Create (Signup)
    getById, // Read (Profile page)
    update, // Update (Edit profile)
    remove, // Delete (remove user)
    query, // List (of users)
    getByUsername, // Used for Login
    toggleFollow, // Toggle follow/unfollow
    savePost, // Save a post
    unsavePost, // Unsave a post
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            // Handle both ObjectId and string _id
            if (user._id && typeof user._id === 'object' && user._id.getTimestamp) {
                user.createdAt = user._id.getTimestamp()
            } else {
                user.createdAt = Date.now()
            }
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        let criteria
        // Try to convert to ObjectId, but handle both ObjectId and string IDs
        try {
            criteria = { _id: ObjectId.createFromHexString(userId) }
        } catch {
            // If it's not a valid ObjectId hex string, use it as-is (for string IDs like "user1")
            criteria = { _id: userId }
        }
        
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        if (!user) throw new Error('User not found')
        delete user.password
        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const getObjectId = (id) => {
            try {
                return ObjectId.createFromHexString(id)
            } catch {
                return id
            }
        }
        const criteria = { _id: getObjectId(userId) }

        const collection = await dbService.getCollection('user')
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable properties
        const getObjectId = (id) => {
            try {
                return ObjectId.createFromHexString(id)
            } catch {
                return id
            }
        }
        const userToSave = {
            _id: getObjectId(user._id), // needed for the returnd obj
            fullname: user.fullname,
            username: user.username,
            imgUrl: user.imgUrl,
            bio: user.bio,
            followers: user.followers || [],
            following: user.following || [],
            savedPosts: user.savedPosts || [],
        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            imgUrl: user.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
            isAdmin: user.isAdmin || false,
            followers: [],
            following: [],
            savedPosts: [],
            bio: user.bio || '',
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

async function toggleFollow(loggedInUserId, userIdToFollow) {
    try {
        const collection = await dbService.getCollection('user')
        
        // Prevent self-follow
        const normalizeId = (id) => {
            // Convert ObjectId to string, or keep string as-is
            if (id && typeof id === 'object' && id.toString) {
                return id.toString()
            }
            return String(id)
        }
        
        const loggedInUserIdStr = normalizeId(loggedInUserId)
        const userIdToFollowStr = normalizeId(userIdToFollow)
        
        if (loggedInUserIdStr === userIdToFollowStr) {
            throw new Error('Cannot follow yourself')
        }
        
        // Helper to get ObjectId or use string
        const getObjectId = (id) => {
            try {
                return ObjectId.createFromHexString(id)
            } catch {
                return id
            }
        }
        
        const loggedInUserObjectId = getObjectId(loggedInUserId)
        const targetUserObjectId = getObjectId(userIdToFollow)
        
        const loggedInUser = await collection.findOne({ _id: loggedInUserObjectId })
        const targetUser = await collection.findOne({ _id: targetUserObjectId })
        
        if (!loggedInUser || !targetUser) throw new Error('User not found')
        
        // Check if following using normalized IDs
        const following = loggedInUser.following || []
        const followingIdsStr = following.map(normalizeId)
        const isFollowing = followingIdsStr.includes(userIdToFollowStr)
        
        // Toggle follow status
        if (isFollowing) {
            // Unfollow
            await collection.updateOne(
                { _id: loggedInUserObjectId },
                { $pull: { following: userIdToFollow } }
            )
            await collection.updateOne(
                { _id: targetUserObjectId },
                { $pull: { followers: loggedInUserId } }
            )
        } else {
            // Follow
            await collection.updateOne(
                { _id: loggedInUserObjectId },
                { $push: { following: userIdToFollow } }
            )
            await collection.updateOne(
                { _id: targetUserObjectId },
                { $push: { followers: loggedInUserId } }
            )
        }
        
        return { isFollowing: !isFollowing }
    } catch (err) {
        logger.error('Cannot toggle follow', err)
        throw err
    }
}

async function savePost(loggedInUserId, postId) {
    try {
        const collection = await dbService.getCollection('user')
        const getObjectId = (id) => {
            try {
                return ObjectId.createFromHexString(id)
            } catch {
                return id
            }
        }
        await collection.updateOne(
            { _id: getObjectId(loggedInUserId) },
            { $addToSet: { savedPosts: postId } }
        )
        return { msg: 'Post saved' }
    } catch (err) {
        logger.error('Cannot save post', err)
        throw err
    }
}

async function unsavePost(loggedInUserId, postId) {
    try {
        const collection = await dbService.getCollection('user')
        const getObjectId = (id) => {
            try {
                return ObjectId.createFromHexString(id)
            } catch {
                return id
            }
        }
        await collection.updateOne(
            { _id: getObjectId(loggedInUserId) },
            { $pull: { savedPosts: postId } }
        )
        return { msg: 'Post unsaved' }
    } catch (err) {
        logger.error('Cannot unsave post', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria,
            },
            {
                fullname: txtCriteria,
            },
            {
                bio: txtCriteria,
            },
        ]
    }
    return criteria
}