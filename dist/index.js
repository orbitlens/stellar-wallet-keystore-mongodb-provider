"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
function getCurrentDate() {
    const now = new Date();
    return {
        date: now,
        offset: now.getTimezoneOffset()
    };
}
function dateToString(dateObject) {
    return (new Date(dateObject.date.getTime() - (dateObject.offset * 60000))).toISOString();
}
function documentToKeyData(document) {
    return {
        encrypterName: document.encrypterName,
        salt: document.salt,
        keysBlob: document.keysBlob,
        creationTime: dateToString(document.creationTime),
        modifiedTime: dateToString(document.modifiedTime)
    };
}
const keysCollectionName = 'keys';
class MongoStorage {
    constructor(options) {
        this._db = null;
        if (!options || !options.connectionString)
            throw new Error('Connection string is null or undefined');
        this.client = new mongodb_1.MongoClient(options.connectionString);
    }
    get db() {
        if (!this._db)
            throw new Error('Db is undefined');
        return this._db;
    }
    /*
     * Initialize storage, db connection.
     **/
    async connect() {
        await this.client.connect();
        this._db = this.client.db();
        await this._db.collection(keysCollectionName).createIndex({ 'userId': 1 }, { unique: true });
    }
    /*
     * Close connection.
     **/
    async close() {
        if (this.client.isConnected())
            this.client.close();
        await Promise.resolve();
    }
    async getKeyData(userId) {
        const keyDataDocument = await this.db.collection(keysCollectionName).findOne({
            userId
        });
        return documentToKeyData(keyDataDocument);
    }
    async addKeyData(keyData, userId) {
        const currentDate = getCurrentDate();
        const document = {
            userId,
            encrypterName: keyData.encrypterName,
            salt: keyData.salt,
            keysBlob: keyData.keysBlob,
            creationTime: currentDate,
            modifiedTime: currentDate
        };
        const { result } = await this.db.collection(keysCollectionName).insertOne(document);
        if (!result.ok)
            throw new Error('Unbale to add key data');
        return this.getKeyData(userId);
    }
    async updateKeyData(keyData, userId) {
        const currentDate = getCurrentDate();
        const { result } = await this.db.collection(keysCollectionName).updateOne({ userId }, {
            $set: {
                encrypterName: keyData.encrypterName,
                salt: keyData.salt,
                keysBlob: keyData.keysBlob,
                modifiedTime: currentDate
            }
        });
        if (!result.ok || result.nModified === 0)
            throw new Error('Unbale to update key data');
        return this.getKeyData(userId);
    }
    async removeKeyData(userId) {
        const result = await this.db.collection(keysCollectionName).deleteOne({
            userId
        });
        if (result.deletedCount === 0)
            throw new Error('Error on user deletion');
    }
    async isDataExist(userId) {
        const count = await this.db.collection(keysCollectionName).count({ userId });
        return count > 0;
    }
}
exports.default = MongoStorage;
