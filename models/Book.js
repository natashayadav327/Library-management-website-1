/**
 * Book Model
 * Mongoose schema for library books
 */

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    genre: {
      type: String,
      trim: true,
      default: 'General'
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true // Allows multiple null values
    },
    coverUrl: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&auto=format'
    },
    coverImage: {
      type: String,
      trim: true
    },
    publishedYear: {
      type: Number,
      min: [1000, 'Invalid year'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    rating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative']
    },
    available: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['Available', 'Borrowed', 'Reserved', 'Checked Out'],
      default: 'Available'
    },
    borrowedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      email: String
    },
    borrowedAt: {
      type: Date
    },
    dueDate: {
      type: Date
    },
    borrowDate: {
      type: Date
    },
    renewalCount: {
      type: Number,
      default: 0,
      min: [0, 'Renewal count cannot be negative']
    },
    maxRenewals: {
      type: Number,
      default: 2,
      min: [0, 'Max renewals cannot be negative']
    },
    tags: [{
      type: String,
      trim: true
    }],
    isNewRelease: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genre: 1, category: 1 });
bookSchema.index({ available: 1, status: 1 });
// Note: isbn index is created automatically via 'unique: true' in schema definition

// Virtual for checking if book is overdue
bookSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.available) return false;
  return new Date() > this.dueDate;
});

// Instance method to borrow a book
bookSchema.methods.borrowBook = function(userId, userName, userEmail, weeks = 3) {
  this.available = false;
  this.status = 'Borrowed';
  this.borrowedBy = {
    userId,
    name: userName,
    email: userEmail
  };
  this.borrowedAt = new Date();
  this.borrowDate = new Date();
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (weeks * 7));
  this.dueDate = dueDate;
  
  return this.save();
};

// Instance method to return a book
bookSchema.methods.returnBook = function() {
  this.available = true;
  this.status = 'Available';
  this.borrowedBy = {};
  this.borrowedAt = null;
  this.borrowDate = null;
  this.dueDate = null;
  this.renewalCount = 0;
  
  return this.save();
};

// Instance method to renew a book
bookSchema.methods.renewBook = function(weeks = 2) {
  if (this.renewalCount >= this.maxRenewals) {
    throw new Error('Maximum renewal limit reached');
  }
  
  if (!this.dueDate) {
    throw new Error('Cannot renew a book that is not borrowed');
  }
  
  const newDueDate = new Date(this.dueDate);
  newDueDate.setDate(newDueDate.getDate() + (weeks * 7));
  this.dueDate = newDueDate;
  this.renewalCount += 1;
  
  return this.save();
};

// Static method to find available books
bookSchema.statics.findAvailable = function() {
  return this.find({ available: true, status: 'Available' });
};

// Static method to find borrowed books
bookSchema.statics.findBorrowed = function() {
  return this.find({ available: false, status: 'Borrowed' });
};

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
