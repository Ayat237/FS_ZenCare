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

  async find(model,query = {}) {
    throw new Error("Method 'find' must be implemented");
  }

  async findById(model,id,options={}) {
    throw new Error("Method 'findById' must be implemented");
  }

  async findOne(model,query = {}) {
    throw new Error("Method 'findOne' must be implemented");
  }
  async save(model, data) {
    throw new Error("Method 'save' must be implemented");
  }

}
export default IDatabase;
