const config = require('config');
const asyncHandler = require('express-async-handler');
const Channel = require('../models/channel');
const User = require('../models/user');

function isPublicChannel(channel) {
  return ['public', 'announcement'].includes(channel.name);
}

exports.getChannel = asyncHandler(async (req, res) => {
  const { channelNameOrId } = req.params;
  const channel = await Channel.fetch(channelNameOrId);
  res.json({
    ...channel.toJSON(),
    isPublic: isPublicChannel(channel),
  });
});

exports.createChannel = asyncHandler(async (req, res) => {
  const { username } = req.user; // C1
  const { usernames } = req.body; // [C2]
  const { doc: channel, created } = await Channel.findOrCreate({
    usernames: [username, ...usernames],
  });
  if (created) {
    res.status(201);
  } else {
    res.status(200);
  }
  res.json(channel);
});

exports.getPrivateChannels = asyncHandler(async (req, res) => {
  const {
    limit = config.pagination.defaultPageSize,
    current = config.pagination.defaultStartPage,
  } = req.query;
  const limitNumber = parseInt(limit, 10);
  const currentNumber = parseInt(current, 10);
  const data = await req.user.getChannels({
    limit: limitNumber,
    skip: (currentNumber - 1) * limitNumber,
  });
  res.json({
    total: await Channel.countDocuments({
      users: { $all: [req.user._id] },
    }),
    limit: limitNumber,
    current: currentNumber,
    data,
  });
});

exports.getPublicChannels = asyncHandler(async (req, res) => {
  const { user } = req;
  const channels = await Channel.find(
    { name: { $in: ['public', 'announcement'] } },
    null,
  );
  const data = await Promise.all(
    channels.map(async (channel) => ({
      ...channel.toJSON(),
      unread_messages_count: await channel.getUnreadMessagesCount({
        user: user._id,
      }),
    })),
  );

  res.json({
    data,
  });
});

exports.updateChannel = asyncHandler(async (req, res) => {
  const { mark_all_messages_read: markAllMessagesRead } = req.body;
  const { channelNameOrId } = req.params;
  let channel = await Channel.fetch(channelNameOrId);
  if (markAllMessagesRead) {
    channel = await channel.markAllMessagesRead({
      user: req.user._id,
    });
  }
  res.json({
    ...channel.toJSON(),
    unread_messages_count: await channel.getUnreadMessagesCount({
      user: req.user._id,
    }),
  });
});

exports.renderChannelPage = asyncHandler(async (req, res) => {
  const channel = await Channel.fetch(req.params.id);
  let title;
  if (channel.name === 'public') {
    title = `Public message`;
  } else if (channel.name === 'announcement') {
    title = `Announcements`;
  } else {
    const peerUserId = channel.users.find((id) => !id.equals(req.user._id));
    const peerUser = await User.findById(peerUserId);
    title = `Send a message to ${peerUser.username}`;
  }
  res.render('channel', {
    user: req.user,
    page: 'channel',
    channelId: req.params.id,
    isPublic: isPublicChannel(channel),
    title,
  });
});

exports.getPeerStatusHistories = asyncHandler(async (req, res) => {
  const {
    limit = config.pagination.defaultPageSize,
    current = config.pagination.defaultStartPage,
    channel: channelId,
  } = req.query;

  const channel = await Channel.findById(channelId);
  const peerUserId = channel.users.find((id) => !id.equals(req.user._id));
  const peerUser = await User.findById(peerUserId);

  const currentNumber = parseInt(current, 10);
  const limitNumber = parseInt(limit, 10);

  const statusHistory = await peerUser.listStatusHistories({
    skip: currentNumber - 1,
    limit: limitNumber,
  });

  res.json({
    total: await statusHistory.length,
    limit: limitNumber,
    current: currentNumber,
    data: statusHistory,
  });
});
