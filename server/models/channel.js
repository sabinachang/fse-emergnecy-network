const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    id: String,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, acc) => {
        // remove the _id of every document before returning the result
        acc.id = doc._id;
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

schema.statics.fetch = async function fetch(nameOrId) {
  const definedChannels = ['public', 'announcement'];
  if (definedChannels.includes(nameOrId)) {
    // findOrCreate
    const existing = await this.findOne({
      name: nameOrId,
    });
    if (!existing) {
      return this.create({
        name: nameOrId,
      });
    }
    return existing;
  }
  return this.findOne({ _id: nameOrId });
};

schema.statics.findOrCreate = async function findOrCreate({ usernames }) {
  // username to userIds
  const userIds = await mongoose
    .model('User')
    .find({ username: usernames }, { id: '$_id' });
  // one of the username user input does not exsits
  if (userIds.length !== usernames.length) {
    const e = new Error(`User Not with username ${usernames.join(',')}`);
    e.status = 404;
    e.error = 'NotFoundError';
    throw e;
  }
  const channels = await mongoose
    .model('Channel')
    .find({ users: { $all: userIds } });
  await mongoose.model('User').populate(channels, {
    path: 'users',
    select: {
      username: 1,
      id: '$_id',
    },
  });
  // channels.length = 0 -> create a new channel
  if (channels.length === 0) {
    const doc = await this.create({
      name: null,
      users: userIds,
    });
    return {
      doc,
      created: true,
    };
  }
  // channels.length = 1 -> return the only one
  if (channels.length === 1) {
    return {
      doc: channels[0],
      created: false,
    };
  }
  // channels.length = 2 -> throw error, data corruption
  const e = new Error(
    `Internal Error: we have ${
      channels.length
    } channels with those 2 users: ${usernames.join(',')}`,
  );
  e.error = 'InternalServerError';
  e.status = 500;
  throw e;
};

schema.methods.getMessages = async function getMessages({
  limit,
  skip,
  search = '',
}) {
  return mongoose.model('Message').list({
    channel: this._id,
    search,
    limit,
    skip,
  });
};

schema.methods.addMessage = async function addMessage({
  content,
  status,
  user,
  helpTypes = [],
}) {
  const message = await mongoose.model('Message').create({
    content,
    status,
    user,
    read_by_users: [user],
    channel: this._id,
    help_types: helpTypes,
  });

  await mongoose.model('MatchingPost').createMatchingPost(message);
  return message;
};

schema.methods.getUnreadMessagesCount = async function getUnreadMessagesCount({
  user,
}) {
  const inactiveUsers = await mongoose.model('User').find(
    {
      active: false,
    },
    '_id',
  );
  return mongoose.model('Message').countDocuments({
    read_by_users: { $nin: [user, ...inactiveUsers.map((u) => u._id)] },
    channel: this._id,
  });
};

schema.methods.markAllMessagesRead = async function markAllMessagesRead({
  user,
}) {
  await mongoose.model('Message').updateMany(
    {
      read_by_users: { $nin: [user] },
      channel: this._id,
    },
    {
      $push: {
        read_by_users: user,
      },
    },
  );
  return this.populate('users', 'username -_id');
};

module.exports = mongoose.model('Channel', schema);
