const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [undefined, 'Ok', 'Help', 'Emergency'],
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('StatusHistory', schema);
