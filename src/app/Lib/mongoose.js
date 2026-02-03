import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) throw new Error('please define mongo URI');

let cashed = global.mongoose;

if (!cashed) {
    cashed = global.mongoose = { connection: null, promise: null }
}

async function connect() {
    if (cashed.connection) return cashed.connection;

    if (!cashed.promise) {
        mongoose.connect(MONGODB_URI).then(m=> m);
    }
    cashed.connection = await cashed.promise;

    return cashed.connection;
}

export default connect;
