const Redis = require("redis");
const { promisify } = require("util");

const redisClient = Redis.createClient();
const getAsync = promisify(redisClient.get).bind(redisClient);

module.exports = { getAsync, redisClient };
