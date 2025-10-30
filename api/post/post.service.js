import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

const PAGE_SIZE = 10

export const postService = {
    query, // List (public)
    getById, // Read (details page)
    getByUserId, // Read (user's posts)
    save, // Create & Update (save post)
    remove, // Delete (remove post)
    update,
    addPostMsg,
    deletePostMsg,
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('post')
        var posts = await collection.find(criteria).sort({ createdAt: -1 }).toArray()
        
        // OPTIMIZATION: Batch fetch all unique user IDs first, then populate in memory
        const usersCollection = await dbService.getCollection('user')
        const userIdsToFetch = new Set()
        
        // Collect all unique user IDs from posts and comments
        for (const post of posts) {
            if (post.by?._id) {
                const id = post.by._id.toString ? post.by._id.toString() : String(post.by._id)
                userIdsToFetch.add(id)
            }
            if (post.comments) {
                for (const comment of post.comments) {
                    if (comment.by?._id) {
                        const id = comment.by._id.toString ? comment.by._id.toString() : String(comment.by._id)
                        userIdsToFetch.add(id)
                    }
                }
            }
        }
        
        // Fetch all users in batch (much faster than individual queries)
        const userIdsArray = Array.from(userIdsToFetch)
        const usersMap = new Map()
        
        if (userIdsArray.length > 0) {
            // Fetch users matching either ObjectId or string IDs
            const users = await usersCollection.find({ 
                $or: [
                    { _id: { $in: userIdsArray.filter(id => id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)).map(id => ObjectId.createFromHexString(id)) } },
                    { _id: { $in: userIdsArray } }
                ]
            }).toArray()
            
            // Create a map for O(1) lookup
            for (const user of users) {
                const id = user._id.toString ? user._id.toString() : String(user._id)
                usersMap.set(id, user)
            }
        }
        
        // Populate user data from the map (much faster)
        for (const post of posts) {
            if (post.by?._id) {
                const id = post.by._id.toString ? post.by._id.toString() : String(post.by._id)
                const user = usersMap.get(id)
                
                if (user) {
                    post.by = {
                        _id: id,
                        fullname: user.fullname,
                        username: user.username,
                        imgUrl: user.imgUrl
                    }
                } else {
                    // Keep original by data if user not found
                    post.by._id = id
                }
            }
            
            // Populate user data for comments
            if (post.comments) {
                for (const comment of post.comments) {
                    if (comment.by?._id) {
                        const id = comment.by._id.toString ? comment.by._id.toString() : String(comment.by._id)
                        const commentUser = usersMap.get(id)
                        
                        if (commentUser) {
                            comment.by = {
                                _id: id,
                                fullname: commentUser.fullname,
                                username: commentUser.username,
                                imgUrl: commentUser.imgUrl
                            }
                        } else {
                            // Keep original by data if user not found
                            comment.by._id = id
                        }
                    }
                }
            }
        }
        
        return posts
    } catch (err) {
        logger.error('cannot find posts', err)
        throw err
    }
}

async function getById(postId) {
    try {
        const collection = await dbService.getCollection('post')
        const post = await collection.findOne({ _id: ObjectId.createFromHexString(postId) })
        
        // Populate user data
        if (post) {
            const usersCollection = await dbService.getCollection('user')
            
            if (post.by?._id) {
                const user = await usersCollection.findOne({ _id: post.by._id })
                if (user) {
                    post.by = {
                        _id: user._id.toString(),
                        fullname: user.fullname,
                        username: user.username,
                        imgUrl: user.imgUrl
                    }
                }
            }
            
            // Populate user data for comments
            if (post.comments) {
                for (const comment of post.comments) {
                    if (comment.by?._id) {
                        const commentUser = await usersCollection.findOne({ _id: comment.by._id })
                        if (commentUser) {
                            comment.by = {
                                _id: commentUser._id.toString(),
                                fullname: commentUser.fullname,
                                username: commentUser.username,
                                imgUrl: commentUser.imgUrl
                            }
                        }
                    }
                }
            }
        }
        
        return post
    } catch (err) {
        logger.error(`while finding post by id: ${postId}`, err)
        throw err
    }
}

async function getByUserId(userId) {
    try {
        const collection = await dbService.getCollection('post')
        const usersCollection = await dbService.getCollection('user')

        // Prepare criteria that covers legacy data as well
        const orCriteria = []
        // Match by ObjectId
        if (userId && userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId)) {
            try {
                orCriteria.push({ 'by._id': ObjectId.createFromHexString(userId) })
            } catch {}
        }
        // Match by string id
        orCriteria.push({ 'by._id': userId })
        // Also match by username (legacy posts)
        const userDoc = await usersCollection.findOne({ _id: (userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId)) ? ObjectId.createFromHexString(userId) : userId })
        if (userDoc?.username) {
            orCriteria.push({ 'by.username': userDoc.username })
        }

        const posts = await collection.find({ $or: orCriteria }).sort({ createdAt: -1 }).toArray()
        
        // Populate user data for posts and comments (using optimized batch method)
        if (posts.length > 0) {
            const usersCollection = await dbService.getCollection('user')
            const userIdsToFetch = new Set()
            
            // Collect all unique user IDs
            for (const post of posts) {
                if (post.by?._id) {
                    const id = post.by._id.toString ? post.by._id.toString() : String(post.by._id)
                    userIdsToFetch.add(id)
                }
                if (post.comments) {
                    for (const comment of post.comments) {
                        if (comment.by?._id) {
                            const id = comment.by._id.toString ? comment.by._id.toString() : String(comment.by._id)
                            userIdsToFetch.add(id)
                        }
                    }
                }
            }
            
            // Batch fetch users
            const userIdsArray = Array.from(userIdsToFetch)
            const usersMap = new Map()
            
            if (userIdsArray.length > 0) {
                const users = await usersCollection.find({ 
                    $or: [
                        { _id: { $in: userIdsArray.filter(id => id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)).map(id => ObjectId.createFromHexString(id)) } },
                        { _id: { $in: userIdsArray } }
                    ]
                }).toArray()
                
                for (const user of users) {
                    const id = user._id.toString ? user._id.toString() : String(user._id)
                    usersMap.set(id, user)
                }
            }
            
            // Populate user data
            for (const post of posts) {
                if (post.by?._id) {
                    const id = post.by._id.toString ? post.by._id.toString() : String(post.by._id)
                    const user = usersMap.get(id)
                    if (user) {
                        post.by = {
                            _id: id,
                            fullname: user.fullname,
                            username: user.username,
                            imgUrl: user.imgUrl
                        }
                    }
                }
                
                if (post.comments) {
                    for (const comment of post.comments) {
                        if (comment.by?._id) {
                            const id = comment.by._id.toString ? comment.by._id.toString() : String(comment.by._id)
                            const commentUser = usersMap.get(id)
                            if (commentUser) {
                                comment.by = {
                                    _id: id,
                                    fullname: commentUser.fullname,
                                    username: commentUser.username,
                                    imgUrl: commentUser.imgUrl
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return posts
    } catch (err) {
        logger.error(`while finding posts by userId: ${userId}`, err)
        throw err
    }
}

async function save(post) {
    try {
        const getObjectId = (id) => {
            try {
                return ObjectId.createFromHexString(id)
            } catch {
                return id
            }
        }
        const postToSave = {
            txt: post.txt,
            imgUrl: post.imgUrl,
            tags: post.tags || [],
            by: {
                _id: getObjectId(post.by._id),
                fullname: post.by.fullname,
                username: post.by.username,
                imgUrl: post.by.imgUrl
            },
            likedBy: post.likedBy || [],
            comments: post.comments || [],
            createdAt: post.createdAt || Date.now(),
        }
        
        const collection = await dbService.getCollection('post')
        
        if (post._id) {
            // Update
            postToSave._id = getObjectId(post._id)
            await collection.updateOne({ _id: postToSave._id }, { $set: postToSave })
        } else {
            // Insert
            const savedPost = await collection.insertOne(postToSave)
            postToSave._id = savedPost.insertedId
        }
        
        // Normalize IDs to strings for the client
        const normalized = {
            ...postToSave,
            _id: postToSave._id?.toString ? postToSave._id.toString() : postToSave._id,
            by: {
                ...postToSave.by,
                _id: postToSave.by._id?.toString ? postToSave.by._id.toString() : postToSave.by._id,
            }
        }
        return normalized
    } catch (err) {
        logger.error('cannot save post', err)
        throw err
    }
}

async function update(post) {
    try {
        const postToUpdate = {
            txt: post.txt,
            imgUrl: post.imgUrl,
            tags: post.tags,
            likedBy: post.likedBy,
            comments: post.comments,
        }
        
        const collection = await dbService.getCollection('post')
        await collection.updateOne({ _id: ObjectId.createFromHexString(post._id) }, { $set: postToUpdate })
        return postToUpdate
    } catch (err) {
        logger.error(`cannot update post ${post._id}`, err)
        throw err
    }
}

async function remove(postId) {
    try {
        const collection = await dbService.getCollection('post')
        await collection.deleteOne({ _id: ObjectId.createFromHexString(postId) })
    } catch (err) {
        logger.error(`cannot remove post ${postId}`, err)
        throw err
    }
}

async function addPostMsg(postId, msg, userId) {
    try {
        const collection = await dbService.getCollection('post')
        const userCollection = await dbService.getCollection('user')
        
        // Get user info
        const user = await userCollection.findOne({ _id: ObjectId.createFromHexString(userId) })
        
        const msgToAdd = {
            id: _makeId(),
            txt: msg.txt,
            by: {
                _id: user._id.toString(),
                fullname: user.fullname,
                username: user.username,
                imgUrl: user.imgUrl
            },
            createdAt: Date.now(),
            likedBy: []
        }
        
        await collection.updateOne(
            { _id: ObjectId.createFromHexString(postId) },
            { $push: { comments: msgToAdd } }
        )
        
        return msgToAdd
    } catch (err) {
        logger.error(`cannot add post msg ${postId}`, err)
        throw err
    }
}

async function deletePostMsg(postId, msgId) {
    try {
        const collection = await dbService.getCollection('post')
        await collection.updateOne(
            { _id: ObjectId.createFromHexString(postId) },
            { $pull: { comments: { id: msgId } } }
        )
    } catch (err) {
        logger.error(`cannot delete post msg ${msgId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            { txt: txtCriteria },
            { tags: { $in: [txtCriteria] } }
        ]
    }
    return criteria
}

function _makeId(length = 5) {
    let txt = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}

