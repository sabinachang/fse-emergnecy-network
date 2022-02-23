const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');
const usernameBlockList = require('./usernameBlockList');
const StatusHistory = require('./statusHistory');
const helpTypes = require('./helpTypes');

const { Schema } = mongoose;

const SALT_ROUNDS = 10;

const SESSION_EXPIRATION_IN_MS = 2 * 60 * 60 * 1000; // 2 hours

const schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      validate: {
        validator: (username) => !usernameBlockList.includes(username),
        message: (props) => `${props.value} is not a valid username!`,
      },
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    role: {
      type: String,
      enum: ['administrator', 'coordinator', 'citizen'],
      default: 'citizen',
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    sessionExpiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [undefined, 'Ok', 'Help', 'Emergency'],
    },
    // user-shelter is one to one relationship
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
    },
    statusLastUpdatedAt: Date,
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
    qualifications: [
      {
        type: String,
        enum: helpTypes,
      },
    ],
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
        acc.online = doc.sessionExpiresAt > new Date();
        delete acc.sessionExpiresAt;
        delete acc.password;
        acc.status_last_updated_at = doc.statusLastUpdatedAt;
        delete acc.statusLastUpdatedAt;
        delete acc._id;
        delete acc.__v;
      },
    },
    virtuals: true,
  },
);

schema.virtual('statuses', {
  ref: 'StatusHistory',
  localField: '_id',
  foreignField: 'user',
});

schema.plugin(uniqueValidator);

schema.statics.register = async function register({
  username,
  password,
  confirmCreation,
}) {
  try {
    const user = new this({
      username,
      password,
      sessionExpiresAt: Date.now() + SESSION_EXPIRATION_IN_MS,
    });

    // validate() needs to be surrounded by try-catch
    // or would get UnhandledPromiseRejectionWarning
    await user.validate();

    // Only validate newUser username and password, but dont save to DB yet
    if (!confirmCreation) {
      return user;
    }

    // User has agreed to being created, save user to DB
    await user.save();

    return user;
  } catch (e) {
    if (
      e.name === 'ValidationError' &&
      e.errors.username &&
      e.errors.username.kind === 'unique'
    ) {
      e.status = 409;
      e.error = 'ValidationError';
      e.message = 'User validation failed: Username is already occupied';
      throw e;
    }
    e.status = 422;
    e.error = 'ValidationError';
    throw e;
  }
};

schema.statics.list = async function list({
  currentUserId,
  filters,
  geoNear,
  limit,
  skip,
}) {
  const conditions = [
    geoNear,
    {
      $match: {
        _id: {
          $ne: currentUserId,
        },
        ...filters,
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        username: 1,
        status: 1,
        coordinates: {
          longitude: {
            $arrayElemAt: ['$location.coordinates', 0],
          },
          latitude: {
            $arrayElemAt: ['$location.coordinates', 1],
          },
        },
        online: {
          $gte: ['$sessionExpiresAt', new Date()],
        },
        qualifications: 1,
      },
    },
    { $sort: { online: -1, username: 1 } },
    {
      $group: {
        _id: null,
        data: { $push: '$$ROOT' },
        total: { $sum: 1 },
      },
    },
    {
      $project: { _id: 0, total: 1, data: { $slice: ['$data', skip, limit] } },
    },
  ].filter((a) => !!a);

  const result = await this.aggregate(conditions);
  if (result.length === 0) {
    return {
      data: [],
      total: 0,
    };
  }
  return { data: result[0].data, total: result[0].total };
};

schema.methods.login = async function login({ password }) {
  if (!this.validPassword(password)) {
    const e = new Error('Incorreact username or password');
    e.status = 422;
    throw e;
  }
  await this.updateOne({
    sessionExpiresAt: Date.now() + SESSION_EXPIRATION_IN_MS,
  });
  return this;
};

schema.methods.logout = async function logout() {
  return this.updateOne({
    sessionExpiresAt: new Date(),
  });
};

schema.methods.updateStatus = async function updateStatus(status) {
  const statusHistory = new StatusHistory({
    status,
    user: this._id,
  });
  await statusHistory.save();

  return this.updateOne({
    status,
  });
};

schema.methods.listStatusHistories = function listStatusHistories({
  limit,
  skip,
}) {
  return mongoose.model('StatusHistory').find(
    {
      user: this._id,
    },
    {
      status: 1,
      createdAt: 1,
    },
    {
      sort: { createdAt: -1 },
      skip,
      limit,
    },
  );
};

function getUnreadMessagesCount(userID, channelID) {
  return mongoose.model('Message').countDocuments({
    read_by_users: { $nin: [userID] },
    channel: channelID,
  });
}

schema.methods.getChannels = async function getChannels({ limit, skip }) {
  const lookupFromUser = {
    $lookup: {
      from: 'users',
      localField: 'users',
      foreignField: '_id',
      as: 'users_detail',
    },
  };
  const pipeline = [
    { $match: { users: { $in: [this._id] } } },
    lookupFromUser,
    { $match: { 'users_detail.active': { $ne: false } } },
    { $skip: skip },
    { $limit: limit },
  ];
  const channels = await mongoose
    .model('Channel')
    .aggregate(pipeline.filter((p) => !!p));

  await mongoose.model('Channel').populate(channels, {
    path: 'users',
    select: '-_id username',
  });

  return Promise.all(
    channels.map(async (channel) => ({
      id: channel._id,
      ...channel,
      unread_messages_count: await getUnreadMessagesCount(
        this._id,
        channel._id,
      ),
    })),
  );
};

schema.pre('save', function userPresave(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  return bcrypt
    .hash(user.password, SALT_ROUNDS)
    .then((hash) => {
      user.password = hash;
      next();
    })
    .catch(next);
});

schema.methods.validPassword = function validPassword(password) {
  return bcrypt.compareSync(password, this.password);
};

schema.statics.SESSION_EXPIRATION_IN_MS = SESSION_EXPIRATION_IN_MS;

schema.methods.updateQualifications = function update(qualifications) {
  return this.updateOne({
    qualifications,
  });
};

schema.statics.listMatch = async function listMatch(list, creatorId) {
  const users = await this.aggregate([
    {
      $match: {
        _id: { $ne: creatorId },
        qualifications: { $in: list },
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);
  return users;
};

schema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', schema);
