import { MongoClient } from "mongodb";

const GOOGLE_CONNECTION_ID = "google-calendar";

function parseScopes(scope) {
  if (Array.isArray(scope)) {
    return scope;
  }

  return (scope ?? "")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export class TokenStore {
  constructor({ uri, databaseName, googleConnectionsCollection }) {
    this.uri = uri;
    this.databaseName = databaseName;
    this.collectionName = googleConnectionsCollection;
    this.clientPromise = null;
  }

  async client() {
    if (!this.clientPromise) {
      this.clientPromise = MongoClient.connect(this.uri, {
        ignoreUndefined: true,
      });
    }

    try {
      return await this.clientPromise;
    } catch (error) {
      this.clientPromise = null;
      throw error;
    }
  }

  async collection() {
    const client = await this.client();
    return client.db(this.databaseName).collection(this.collectionName);
  }

  async read() {
    const collection = await this.collection();
    return collection.findOne(
      { _id: GOOGLE_CONNECTION_ID },
      { projection: { _id: 0 } },
    );
  }

  async write(tokens) {
    const collection = await this.collection();
    const scopes = parseScopes(tokens.scopes ?? tokens.scope);

    await collection.updateOne(
      { _id: GOOGLE_CONNECTION_ID },
      {
        $set: {
          ...tokens,
          scope: scopes.join(" "),
          scopes,
        },
      },
      { upsert: true },
    );
  }

  async clear() {
    const collection = await this.collection();
    await collection.deleteOne({ _id: GOOGLE_CONNECTION_ID });
  }
}
