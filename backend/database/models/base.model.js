class BaseModel {
  constructor(database, collectionName) {
    this.database = database;
    this.collection = collectionName;
  }

  async create(data) {
    return await  this.database.createDocument(this.collection,data);
  }

  async updateById(id, data) {
    return await this.database.updateById(this.collection, id,data);
  }

  async saveById(id, data) {
    return await this.database.saveById(this.collection, id,data);
  }

  async deleteById(id) {
    return await this.database.deleteById(this.collection,id);
  }

  async find(query = {}, options = {}) {
    return await this.database.findDocument(this.collection, query,options);
  }

  async findById(id,options={}) {
    return await this.database.findById(this.collection, id,options);
  }

  async findOne(query = {},options = {}) {
    return await this.database.findOne(this.collection,query,options);
  }

  async save(document) {
    try {
      if (!document) {
        throw new Error('Document is required for save operation');
      }
      return await this.database.saveDocument(this.collection, document);
    } catch (error) {
      throw error;
    }
  }

  
}

export default BaseModel;
