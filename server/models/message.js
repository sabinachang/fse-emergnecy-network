const mongoose = require('mongoose');
const helpTypes = require('./helpTypes');

const schema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [undefined, 'Ok', 'Help', 'Emergency'],
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    read_by_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    help_types: [
      {
        type: String,
        enum: helpTypes,
      },
    ],
  },

  {
    timestamps: true,
    toJSON: {
      transform: (doc, acc) => {
        // remove the _id of every document before returning the result
        acc.id = doc._id.toString();
        acc.created_at = doc.createdAt;
        acc.updated_at = doc.updatedAt;
        delete acc.createdAt;
        delete acc.updatedAt;
        delete acc._id;
        delete acc.__v;
      },
    },
  },
);

schema.index({ content: 'text' });

schema.statics.list = async function list({
  user,
  search,
  channel,
  limit,
  skip,
}) {
  const matchSecond = { 'user_detail.active': true };
  const matchFirst = {};
  let lookupFromChannel;
  if (user) {
    lookupFromChannel = {
      $lookup: {
        from: 'channels',
        localField: 'channel',
        foreignField: 'users',
        as: 'users',
      },
    };
  }
  const lookupFromUser = {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user_detail',
    },
  };
  if (search) {
    matchFirst.$text = {
      $search: search,
    };
  }
  if (channel) {
    matchFirst.channel = channel;
  }
  const pipeline = [
    { $match: matchFirst },
    lookupFromChannel,
    lookupFromUser,
    {
      $unwind: '$user_detail',
    },
    { $match: matchSecond },
    {
      $project: {
        _id: 1,
        id: '$id',
        content: 1,
        user: 1,
        help_types: 1,
        status: 1,
        created_at: '$createdAt',
      },
    },
    { $sort: { created_at: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];
  const messages = await this.aggregate(pipeline.filter((p) => !!p));
  await this.populate(messages, {
    path: 'user',
    select: '-_id',
    // TODO: NOT WORKING - INVESTIGATE
    populate: {
      path: 'statuses',
    },
  });
  return messages;
};

module.exports = mongoose.model('Message', schema);
