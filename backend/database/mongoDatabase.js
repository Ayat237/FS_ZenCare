import mongoose from "mongoose";
import IDatabase from "./interfaces/IDatabase.js";
import { logger } from "../src/utils/index.js";
import { Medication, Patient, User } from "./models/index.js";

class MongooseDatabase extends IDatabase {
  constructor(uri) {
    super();
    this.uri = uri;
    this.model = {
      patient: Patient,
      user: User,
      medication: Medication,
    };
  }

  async connect() {
    try {
      await mongoose.connect(this.uri);
      logger.info("Database connected successfully");
    } catch (error) {
      logger.error("database connection error:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
  async disconnect() {
    try {
      await mongoose.disconnect(this.uri);
      logger.info("Database disconnected successfully");
    } catch (error) {
      logger.error("database disconnection error:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async createDocument(collection, data) {
    try {
      const model = this.model[collection];
      if (!model) {
        throw new Error(`Model for collection ${collection} not found`);
      }
      const document = new model(data);
      await document.save();
      logger.info(`Created document in ${model}`, { id: document._id });
      return document;
    } catch (error) {
      logger.error("error in creating document:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async updateById(collection, id, data) {
    try {
      const model = this.model[collection];
      if (!model) {
        throw new Error(`Model for collection ${collection} not found`);
      }
      const document = await model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      logger.info(`Updated document in ${model}`, { id: document._id });
      return document;
    } catch (error) {
      logger.error("error in updating document:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
  async deleteById(collection, id) {
    try {
      const model = this.model[collection];
      if (!model) {
        throw new Error(`Model for collection ${collection} not found`);
      }
      const document = await model.findByIdAndDelete(id);
      logger.info(`Deleted document in ${model}`, { id: document._id });
      return document;
    } catch (error) {
      logger.error("error in deleting document:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
  async findDocument(collection, query = {},options = {}) {
    try {
      const model = this.model[collection];
      if (!model) {
        throw new Error(`Model for collection ${collection} not found`);
      }
  
      // Build the query starting with findOne
      let queryBuilder = model.find(query);
  
      // Apply query options dynamically
      if (options.select) {
        queryBuilder = queryBuilder.select(options.select);
      }
  
      if (options.populate) {
        queryBuilder = queryBuilder.populate(options.populate);
      }
  
      if (options.sort) {
        queryBuilder = queryBuilder.sort(options.sort);
      }
  
      if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
      }
  
      if (options.skip) {
        queryBuilder = queryBuilder.skip(options.skip);
      }
  
      if (options.lean) {
        queryBuilder = queryBuilder.lean();
      }
  
      if (options.conditions) {
        // Add additional conditions to the query
        queryBuilder = queryBuilder.setQuery({
          ...queryBuilder.getQuery(),
          ...options.conditions,
        });
      }
  
      if (options.fields) {
        // Alternative to `select` for specific field projections
        queryBuilder = queryBuilder.select(options.fields);
      }
  
      if (options.execOptions) {
        // Pass additional execution options (e.g., collation, session)
        queryBuilder = queryBuilder.setOptions(options.execOptions);
      }
  
      const result = await queryBuilder.exec();
  
      logger.debug(`Found documents in ${collection}`, { query, options });
  
      return result;
    } catch (error) {
      logger.error(`Failed to find documents in ${this.model.modelName}`, {
        error: error.message,
        stack: error.stack,
        query,
      });
      throw error;
    }
  }
  async findOne(collection, query = {}, options = {}) {
    try {
      const model = this.model[collection];
      if (!model) {
        throw new Error(`Model for collection ${collection} not found`);
      }
  
      // Build the query starting with findOne
      let queryBuilder = model.findOne(query);

      
  
      // Apply query options dynamically
      if (options.select) {
        queryBuilder = queryBuilder.select(options.select);
      }
  
      if (options.populate) {
        queryBuilder = queryBuilder.populate(options.populate);
      }
  
      if (options.sort) {
        queryBuilder = queryBuilder.sort(options.sort);
      }
  
      if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
      }
  
      if (options.skip) {
        queryBuilder = queryBuilder.skip(options.skip);
      }
  
      if (options.lean) {
        queryBuilder = queryBuilder.lean();
      }
  
      if (options.conditions) {
        // Add additional conditions to the query
        queryBuilder = queryBuilder.setQuery({
          ...queryBuilder.getQuery(),
          ...options.conditions,
        });
      }
  
      if (options.fields) {
        // Alternative to `select` for specific field projections
        queryBuilder = queryBuilder.select(options.fields);
      }
  
      if (options.execOptions) {
        // Pass additional execution options (e.g., collation, session)
        queryBuilder = queryBuilder.setOptions(options.execOptions);
      }
  
      const result = await queryBuilder.exec();
  
      logger.debug(`Found one document in ${collection}`, { query, options });
  
      return result;
    } catch (error) {
      logger.error(`Failed to find one document in ${this.model.modelName}`, {
        error: error.message,
        stack: error.stack,
        query,
        options,
      });
      throw error;
    }
  }
  async findById(collection, id, options = {}) {
    try {
      const model = this.model[collection];
      let query = model.findById(id);

      // Apply query options dynamically
      if (options.select) {
        query = query.select(options.select);
      }

      if (options.populate) {
        query = query.populate(options.populate);
      }

      if (options.sort) {
        query = query.sort(options.sort);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.skip) {
        query = query.skip(options.skip);
      }

      if (options.lean) {
        query = query.lean();
      }

      if (options.conditions) {
        // Add additional conditions to the query
        query = query.setQuery({ ...query.getQuery(), ...options.conditions });
      }

      if (options.fields) {
        // Alternative to `select` for specific field projections
        query = query.select(options.fields);
      }

      if (options.execOptions) {
        // Pass additional execution options (e.g., collation, session)
        query = query.setOptions(options.execOptions);
      }

      const result = await query.exec();
 

      logger.debug(`Found one document in ${collection}`, { id });

      return result;
    } catch (error) {
      logger.error(`Failed to find one document in ${this.model.modelName}`, {
        error: error.message,
        stack: error.stack,
        id,
      });
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const user = await this.model.user.findOne({ email });
      return user;
    } catch (error) {
      logger.error("Error in finding user by email:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async saveDocument(collection, document) {
    try {
      const model = this.model[collection];
      const modelInstance =
        document instanceof model ? document : new model(document);

      // Save the document
      return await modelInstance.save();
    } catch (error) {
      throw error;
    }
  }
}

export default MongooseDatabase;
