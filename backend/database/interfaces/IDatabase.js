class IDatabase {
  constructor() {
    if (this.constructor === IDatabase) {
      throw new Error("IDatabase is an abstract class and cannot be instantiated.");
    }
  }
  connect() {
    throw new Error("Method 'connect' must be implemented");
  }
  disconnect() {
    throw new Error("Method 'disconnect' must be implemented");
  }
  async create(model, data) {
    throw new Error("Method 'create' must be implemented");
  }

  async updateById(model,id, data) {
    throw new Error("Method 'updateById' must be implemented");
  }

  async deleteById(model,id) {
    throw new Error("Method 'deleteById' must be implemented");
  }

  async find(model,query = {},options = {}) {
    throw new Error("Method 'find' must be implemented");
  }

  async findById(model,id,options={}) {
    throw new Error("Method 'findById' must be implemented");
  }

  async findOne(model,query = {},options = {}) {
    throw new Error("Method 'findOne' must be implemented");
  }

  async findOneAndDelete(model,query = {},options = {}) {
    throw new Error("Method 'findOneAndDelete' must be implemented");
  }

  async deleteMany(model,query = {}) {
    throw new Error("Method 'deleteMany' must be implemented");
  }
  async save(model, data) {
    throw new Error("Method 'save' must be implemented");
  }

  async findByEmail(email) {
    throw new Error("Method 'findByEmail' must be implemented");
  }
}
export default IDatabase;
