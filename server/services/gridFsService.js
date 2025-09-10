const mongoose = require('mongoose');
const { createReadStream } = require('fs');
const { promises: fs } = require('fs');
const path = require('path');
const stream = require('stream');


const gridFsService = {
  /**
   * Upload a file to GridFS
   * @param {String} filePath Path to the file to upload
   * @param {String} filename Name to give the file in GridFS
   * @param {Object} metadata Additional metadata to store with the file
   * @returns {Promise<Object>} File info including id
   */
  uploadFileFromPath: async (filePath, filename, metadata = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const conn = mongoose.connection;
        
        if (!conn || conn.readyState !== 1) {
          return reject(new Error('MongoDB connection not ready'));
        }
        
        // Set up GridFS bucket
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
          bucketName: 'resumes'
        });
        
        const uploadStream = bucket.openUploadStream(filename, {
          metadata: {
            ...metadata,
            uploadedAt: new Date()
          }
        });
        
        // Get file info
        const fileData = await fs.readFile(filePath);
        
        // Create a readable stream from buffer
        const readableStream = new stream.PassThrough();
        readableStream.end(fileData);
        
        // Pipe the file to GridFS
        readableStream.pipe(uploadStream);
        
        uploadStream.on('error', (error) => {
          console.error('Error uploading to GridFS:', error);
          reject(error);
        });
        
        uploadStream.on('finish', (result) => {
          resolve({
            id: uploadStream.id,
            filename: uploadStream.filename,
            length: uploadStream.length
          });
        });
      } catch (error) {
        console.error('GridFS upload error:', error);
        reject(error);
      }
    });
  },
  
  /**
   * Upload a file to GridFS from a buffer
   * @param {Buffer} fileBuffer File data buffer
   * @param {String} filename Name to give the file in GridFS
   * @param {Object} metadata Additional metadata to store with the file
   * @returns {Promise<Object>} File info including id
   */
  uploadFileFromBuffer: async (fileBuffer, filename, metadata = {}) => {
    return new Promise((resolve, reject) => {
      try {
        const conn = mongoose.connection;
        
        if (!conn || conn.readyState !== 1) {
          return reject(new Error('MongoDB connection not ready'));
        }
        
        // Set up GridFS bucket
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
          bucketName: 'resumes'
        });
        
        const uploadStream = bucket.openUploadStream(filename, {
          metadata: {
            ...metadata,
            uploadedAt: new Date()
          }
        });
        
        // Create a readable stream from buffer
        const readableStream = new stream.PassThrough();
        readableStream.end(fileBuffer);
        
        // Pipe the file to GridFS
        readableStream.pipe(uploadStream);
        
        uploadStream.on('error', (error) => {
          console.error('Error uploading to GridFS:', error);
          reject(error);
        });
        
        uploadStream.on('finish', (result) => {
          resolve({
            id: uploadStream.id,
            filename: uploadStream.filename,
            length: uploadStream.length
          });
        });
      } catch (error) {
        console.error('GridFS upload error:', error);
        reject(error);
      }
    });
  },
  
  /**
   * Download a file from GridFS by ID
   * @param {String} fileId GridFS file ID
   * @returns {Promise<stream.Readable>} Stream containing the file
   */
  downloadFileById: async (fileId) => {
    try {
      const conn = mongoose.connection;
      
      if (!conn || conn.readyState !== 1) {
        throw new Error('MongoDB connection not ready');
      }
      
      // Convert string ID to ObjectId if needed
      const objectId = typeof fileId === 'string' ? 
        new mongoose.Types.ObjectId(fileId) : fileId;
      
      // Set up GridFS bucket
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'resumes'
      });
      
      // Create and return download stream
      return bucket.openDownloadStream(objectId);
    } catch (error) {
      console.error('GridFS download error:', error);
      throw error;
    }
  },
  
  /**
   * Get file info from GridFS by ID
   * @param {String} fileId GridFS file ID
   * @returns {Promise<Object>} File info
   */
  getFileInfo: async (fileId) => {
    try {
      const conn = mongoose.connection;
      
      if (!conn || conn.readyState !== 1) {
        throw new Error('MongoDB connection not ready');
      }
      
      // Convert string ID to ObjectId if needed
      const objectId = typeof fileId === 'string' ? 
        new mongoose.Types.ObjectId(fileId) : fileId;
      
      // Query for the file info
      const file = await conn.db.collection('resumes.files')
        .findOne({ _id: objectId });
      
      return file;
    } catch (error) {
      console.error('Error getting GridFS file info:', error);
      throw error;
    }
  },
  
  /**
   * Delete a file from GridFS by ID
   * @param {String} fileId GridFS file ID
   * @returns {Promise<Boolean>} True if deletion was successful
   */
  deleteFile: async (fileId) => {
    try {
      const conn = mongoose.connection;
      
      if (!conn || conn.readyState !== 1) {
        throw new Error('MongoDB connection not ready');
      }
      
      // Convert string ID to ObjectId if needed
      const objectId = typeof fileId === 'string' ? 
        new mongoose.Types.ObjectId(fileId) : fileId;
      
      // Set up GridFS bucket
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'resumes'
      });
      
      await bucket.delete(objectId);
      return true;
    } catch (error) {
      console.error('Error deleting GridFS file:', error);
      return false;
    }
  }
};

module.exports = gridFsService;