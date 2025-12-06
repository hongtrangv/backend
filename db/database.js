class Database {
  constructor() {
    if (this.constructor === Database) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  async getAll() {
    throw new Error("Method 'getAll()' must be implemented.");
  }

  async getById(id) {
    throw new Error("Method 'getById()' must be implemented.");
  }

  async create(data) {
    throw new Error("Method 'create()' must be implemented.");
  }

  async update(id, data) {
    throw new Error("Method 'update()' must be implemented.");
  }

  async delete(id) {
    throw new Error("Method 'delete()' must be implemented.");
  }
}

class MemoryDatabase extends Database {
  constructor() {
    super();
    this.items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
  }

  async getAll(filters = {}) {
    let items = this.items;
    if (filters.name) {
        items = items.filter(item => item.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    return items;
  }

  async getById(id) {
    return this.items.find(i => i.id === id);
  }

  async create(data) {
    const newItem = {
      id: this.items.length > 0 ? Math.max(...this.items.map(i => i.id)) + 1 : 1,
      ...data
    };
    this.items.push(newItem);
    return newItem;
  }

  async update(id, data) {
    const item = await this.getById(id);
    if (item) {
      Object.assign(item, data);
      return item;
    }
    return null;
  }

  async delete(id) {
    const index = this.items.findIndex(i => i.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Placeholder for Firestore Database
class FirestoreDatabase extends Database {
    // TODO: Implement Firestore connection and methods
}

// Placeholder for Redis Database
class RedisDatabase extends Database {
    // TODO: Implement Redis connection and methods
}

module.exports = { 
    MemoryDatabase,
    FirestoreDatabase, 
    RedisDatabase 
};