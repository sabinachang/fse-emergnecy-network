const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    type: {
      type: String,
      enum: ['Bushfire', 'Cyclone', 'Thunderstorm', 'Tsunami'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['Emergency', 'Medium', 'Relax'],
      required: true,
    },
    people_injured: {
      type: Boolean,
      required: true,
    },
  },

  {
    timestamps: true,
  },
);

schema.index({ location: '2dsphere' });

schema.statics.list = async function list({
  afterDate,
  maxDistance,
  longitude,
  latitude,
  limit,
  skip,
}) {
  const query = {};
  if (afterDate) {
    query.createdAt = { $gt: afterDate };
  }
  const geoNear = {
    near: { type: 'Point', coordinates: [longitude, latitude] },
    distanceField: 'distance',
    query,
    maxDistance,
    spherical: true,
  };
  const pipeline = [
    { $geoNear: geoNear },
    { $sort: { distance: 1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];
  const cases = await this.aggregate(pipeline.filter((p) => !!p));

  return cases;
};

module.exports = mongoose.model('Emergency', schema);
