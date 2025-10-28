import configProd from './prod.js'
import configDev from './dev.js'

export var config

// Prefer .env when available
const envDbUrl = process.env.MONGODB_URL || process.env.MONGO_URL
const envDbName = process.env.MONGODB_DB_NAME || process.env.DB_NAME

if (envDbUrl && envDbName) {
    config = { dbURL: envDbUrl, dbName: envDbName }
} else if (process.env.NODE_ENV === 'production') {
    config = configProd
} else {
    config = configDev
}