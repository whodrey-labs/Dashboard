import fs from "node:fs/promises";
import path from "node:path";

// Tiny development-only token store.
// This lets you test with your own Google account before a real database exists.
export class TokenStore {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
  }

  async read() {
    try {
      const contents = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(contents);
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }

      throw error;
    }
  }

  async write(tokens) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, `${JSON.stringify(tokens, null, 2)}\n`);
  }

  async clear() {
    try {
      await fs.unlink(this.filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
}
