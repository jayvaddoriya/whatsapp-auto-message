/**
 * Custom MongoDB-based auth state for Baileys.
 * Replaces useMultiFileAuthState so no filesystem is needed.
 * Auth credentials are stored in MongoDB via the AuthCredential model.
 */
const {
  initAuthCreds,
  BufferJSON,
  proto
} = require('@whiskeysockets/baileys');

const AuthCredential = require('../models/AuthCredential');

/**
 * Creates a Baileys-compatible auth state backed by MongoDB.
 * Drop-in replacement for useMultiFileAuthState(folder).
 *
 * @param {string} adminId - The admin ID to scope credentials to
 * @returns {{ state: AuthenticationState, saveCreds: () => Promise<void> }}
 */
const useMongoDBAuthState = async (adminId) => {
  const adminKey = String(adminId);

  // Helper: fix key names (same as Baileys does for filenames)
  const fixKey = (key) => key?.replace(/\//g, '__')?.replace(/:/g, '-');

  // Read a credential value from MongoDB
  const readData = async (key) => {
    try {
      const doc = await AuthCredential.findOne({ admin_id: adminKey, key: fixKey(key) });
      if (doc && doc.value) {
        return JSON.parse(doc.value, BufferJSON.reviver);
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Write a credential value to MongoDB
  const writeData = async (data, key) => {
    const fixedKey = fixKey(key);
    const value = JSON.stringify(data, BufferJSON.replacer);
    await AuthCredential.findOneAndUpdate(
      { admin_id: adminKey, key: fixedKey },
      { value, updated_at: new Date() },
      { upsert: true }
    );
  };

  // Remove a credential from MongoDB
  const removeData = async (key) => {
    try {
      await AuthCredential.deleteOne({ admin_id: adminKey, key: fixKey(key) });
    } catch (error) {
      // Ignore removal errors
    }
  };

  // Load existing creds or create fresh ones
  const creds = (await readData('creds.json')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}.json`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const file = `${category}-${id}.json`;
              tasks.push(value ? writeData(value, file) : removeData(file));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: async () => {
      await writeData(creds, 'creds.json');
    }
  };
};

/**
 * Delete all auth credentials for an admin from MongoDB.
 * Call this when disconnecting/logging out.
 *
 * @param {string} adminId - The admin ID whose credentials to delete
 */
const deleteAuthState = async (adminId) => {
  await AuthCredential.deleteMany({ admin_id: String(adminId) });
};

module.exports = { useMongoDBAuthState, deleteAuthState };
