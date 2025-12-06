const redis = require('redis');

let redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// When running locally, you may have a REDIS_URL from a production environment in your .env file.
// This URL will start with rediss://, indicating a TLS connection.
// The local Redis instance (from docker-compose) does not use TLS.
// The following block changes the protocol to redis:// when not in a production environment.
if (process.env.NODE_ENV !== 'production') {
    if (redisUrl.startsWith('rediss://')) {
        redisUrl = redisUrl.replace('rediss://', 'redis://');
    }
}

const redisClient = redis.createClient({
    url: redisUrl
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports = redisClient;
