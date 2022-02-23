const config = require('config');
const asyncHandler = require('express-async-handler');
const Message = require('../models/message');
const Channel = require('../models/channel');
const { removeStopWords } = require('../models/messageStopWords');
const MatchingPost = require('../models/matchingPost');

exports.createMessage = asyncHandler(async (req, res) => {
  const { content, channel: channelNameOrId, helpTypes } = req.body;
  const { status, role } = req.user;

  if (channelNameOrId === 'announcement' && role === 'citizen') {
    const err = new Error(
      'Only coordinator or administrator can make annoucements',
    );
    err.status = 401;
    err.error = 'AuthenticationError';
    throw err;
  }

  const channel = await Channel.fetch(channelNameOrId);
  const newMessage = await channel.addMessage({
    content,
    status,
    user: req.user._id,
    helpTypes,
  });
  const hasMatch = await MatchingPost.findOne({ message: newMessage._id });

  if (channelNameOrId === 'public' || channelNameOrId === 'announcement') {
    if (hasMatch) {
      hasMatch.match_users.forEach((e) => {
        req.app.io.to(e).emit('updateMatchPosts');
      });
    }
    req.app.io.sockets.emit('updateMessages', channel._id, {
      isPublic: true,
      from: channel.name,
    });
  } else {
    const peerUserId = channel.users.find((id) => !id.equals(req.user._id));
    req.app.io.to(peerUserId).emit('updateMessages', channel._id, {
      isPublic: false,
      from: req.user.username,
    });
  }
  res.status(201).json({
    content: newMessage.content,
    status: newMessage.status,
    help_types: newMessage.help_types,
    user: {
      username: req.user.username,
    },
    created_at: newMessage.createdAt,
  });
});

exports.getMessages = asyncHandler(async (req, res) => {
  const {
    limit = config.pagination.defaultPageSize,
    current = config.pagination.defaultStartPage,
    channel: channelNameOrId,
    search,
  } = req.query;
  const currentNumber = parseInt(current, 10);
  const filteredSearch = removeStopWords(search);
  if (search !== '' && search !== undefined && filteredSearch === '') {
    res.json({
      total: 0,
      limit,
      current,
      data: [],
    });
  } else if (channelNameOrId) {
    const limitNumber = filteredSearch === '' ? parseInt(limit, 10) : 10;

    const channel = await Channel.fetch(channelNameOrId);

    const messages = await channel.getMessages({
      limit: limitNumber,
      skip: (currentNumber - 1) * limitNumber,
      search: filteredSearch,
    });

    let total;
    if (filteredSearch === '') {
      // Normal display
      total = await Message.countDocuments({ channel: channel._id });
    } else {
      // Search result display
      total = await Message.countDocuments({
        $text: {
          $search: filteredSearch,
        },
        channel: channel._id,
      });
    }
    res.json({
      total,
      limitNumber,
      current,
      data: messages,
    });
  }
});
