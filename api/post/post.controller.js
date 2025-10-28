import { postService } from './post.service.js'
import { logger } from '../../services/logger.service.js'

export async function getPost(req, res) {
    try {
        const post = await postService.getById(req.params.id)
        res.send(post)
    } catch (err) {
        logger.error('Failed to get post', err)
        res.status(400).send({ err: 'Failed to get post' })
    }
}

export async function getPosts(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
        }
        const posts = await postService.query(filterBy)
        res.send(posts)
    } catch (err) {
        logger.error('Failed to get posts', err)
        res.status(400).send({ err: 'Failed to get posts' })
    }
}

export async function savePost(req, res) {
    try {
        const post = req.body
        const savedPost = await postService.save(post)
        res.send(savedPost)
    } catch (err) {
        logger.error('Failed to save post', err)
        res.status(400).send({ err: 'Failed to save post' })
    }
}

export async function deletePost(req, res) {
    try {
        await postService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete post', err)
        res.status(400).send({ err: 'Failed to delete post' })
    }
}

export async function addPostMsg(req, res) {
    try {
        const postId = req.params.id
        const msg = {
            txt: req.body.txt
        }
        // Get userId from request body or use a test user
        const userId = req.body.userId || '64f0a1c2b3d4e5f678901234'
        const savedMsg = await postService.addPostMsg(postId, msg, userId)
        res.send(savedMsg)
    } catch (err) {
        logger.error('Failed to add post msg', err)
        res.status(400).send({ err: 'Failed to add post msg' })
    }
}

export async function updatePostLike(req, res) {
    try {
        const post = req.body
        const savedPost = await postService.update(post)
        res.send(savedPost)
    } catch (err) {
        logger.error('Failed to update post like', err)
        res.status(400).send({ err: 'Failed to update post like' })
    }
}

export async function deletePostMsg(req, res) {
    try {
        const { id, msgId } = req.params
        await postService.deletePostMsg(id, msgId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete post msg', err)
        res.status(400).send({ err: 'Failed to delete post msg' })
    }
}

