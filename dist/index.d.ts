interface EncryptedKeysData {
    encrypterName: string;
    salt: string;
    keysBlob: string;
    creationTime: string;
    modifiedTime: string;
}
interface ConnectionOptions {
    connectionString: string;
}
export default class MongoStorage {
    constructor(options: ConnectionOptions);
    private client;
    private _db;
    private readonly db;
    connect(): Promise<void>;
    close(): Promise<void>;
    getKeyData(userId: string): Promise<EncryptedKeysData>;
    addKeyData(keyData: EncryptedKeysData, userId: string): Promise<EncryptedKeysData>;
    updateKeyData(keyData: EncryptedKeysData, userId: string): Promise<EncryptedKeysData>;
    removeKeyData(userId: string): Promise<void>;
    isDataExist(userId: string): Promise<boolean>;
}
export {};
