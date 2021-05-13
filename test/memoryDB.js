const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const mongod = new MongoMemoryServer();

module.exports.connect = async () => {
  await mongoose.connection.close();
  const uri = await mongod.getUri();
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10,
  };
  await mongoose.connect(uri, options);
};

module.exports.close = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close(true);
  await mongod.stop();
};

module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
