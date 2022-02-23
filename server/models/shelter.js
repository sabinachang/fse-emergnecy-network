const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: String,
    address: String,
    description: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      // [lgt ,lat]
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  {
    toJSON: {
      transform: (doc, acc) => {
        if (doc._id) {
          acc.id = doc._id.toString();
        }
        if (doc.location.coordinates) {
          acc.coordinates = {
            longitude: doc.location.coordinates[0],
            latitude: doc.location.coordinates[1],
          };
        }
        delete acc.location;
        delete acc._id;
        delete acc.__v;
      },
    },
  },
);

schema.index({ location: '2dsphere' });

module.exports = mongoose.model('shelter', schema);
