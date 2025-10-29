import express from 'express'
import { seedDatabase } from './seed.controller.js'

export const seedRoutes = express.Router()

seedRoutes.get('/', seedDatabase)

