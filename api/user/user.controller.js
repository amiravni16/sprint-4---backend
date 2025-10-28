import { userService } from './user.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(400).send({ err: 'Failed to get user' })
    }
}

export async function getUsers(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
            minBalance: +req.query?.minBalance || 0
        }
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(400).send({ err: 'Failed to get users' })
    }
}

export async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete user', err)
        res.status(400).send({ err: 'Failed to delete user' })
    }
}

export async function updateUser(req, res) {
    try {
        const user = req.body
        const savedUser = await userService.update(user)
        res.send(savedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(400).send({ err: 'Failed to update user' })
    }
}

export async function toggleFollowUser(req, res) {
    try {
        const loggedInUserId = req.params.loggedInUserId
        const userIdToFollow = req.params.userIdToFollow
        const result = await userService.toggleFollow(loggedInUserId, userIdToFollow)
        res.send(result)
    } catch (err) {
        logger.error('Failed to toggle follow', err)
        res.status(400).send({ err: 'Failed to toggle follow' })
    }
}

export async function saveUserPost(req, res) {
    try {
        const loggedInUserId = req.params.loggedInUserId
        const postId = req.params.postId
        const result = await userService.savePost(loggedInUserId, postId)
        res.send(result)
    } catch (err) {
        logger.error('Failed to save post', err)
        res.status(400).send({ err: 'Failed to save post' })
    }
}

export async function unsaveUserPost(req, res) {
    try {
        const loggedInUserId = req.params.loggedInUserId
        const postId = req.params.postId
        const result = await userService.unsavePost(loggedInUserId, postId)
        res.send(result)
    } catch (err) {
        logger.error('Failed to unsave post', err)
        res.status(400).send({ err: 'Failed to unsave post' })
    }
}
