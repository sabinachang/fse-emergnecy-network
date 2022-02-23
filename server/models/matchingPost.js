const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    match_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    read_by_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

schema.statics.list = async function list({ userId, limit = 20, skip = 0 }) {
  const pipeline = [
    {
      $match: {
        match_users: { $in: [userId] },
      },
    },
    {
      $project: {
        _id: 1,
        message: 1,
        created_at: 1,
      },
    },
    { $sort: { created_at: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];
  const posts = await this.aggregate(pipeline);
  await this.populate(posts, {
    path: 'message',
    select: 'content status user help_types createdAt ',
    populate: { path: 'user', select: 'username _id' },
  });
  return posts;
};

schema.statics.createMatchingPost = async function createMatchingPost(message) {
  const matchUsers = await mongoose
    .model('User')
    .listMatch(message.help_types, message.user);

  if (matchUsers.length === 0) {
    return null;
  }

  return this.create({
    message: message._id,
    match_users: matchUsers,
    read_by_users: [],
  });
};

schema.statics.getUnreadMatchCount = function getUnreadMatchCount({ user }) {
  return this.countDocuments({
    match_users: { $in: [user] },
    read_by_users: { $nin: [user] },
  });
};

schema.statics.markAllMatchRead = async function markAllMatchRead({ user }) {
  await this.updateMany(
    {
      match_users: { $in: [user] },
      read_by_users: { $nin: [user] },
    },
    {
      $push: {
        read_by_users: user,
      },
    },
  );
};
module.exports = mongoose.model('MatchingPost', schema);
