import express from 'express'
import { getPost, getPosts, savePost, deletePost, addPostMsg, updatePostLike, deletePostMsg } from './post.controller.js'

const router = express.Router()

router.get('/', getPosts)
router.get('/:id', getPost)
router.post('/', savePost)
router.put('/:id', savePost)
router.delete('/:id', deletePost)
router.post('/:id/msg', addPostMsg)
router.put('/:id/like', updatePostLike)
router.delete('/:id/msg/:msgId', deletePostMsg)

export const postRoutes = router

