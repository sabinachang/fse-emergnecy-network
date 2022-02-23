const config = require('config');
const asyncHandler = require('express-async-handler');
const MatchingPost = require('../models/matchingPost');

exports.getMatchingPosts = asyncHandler(async (req, res) => {
  const {
    limit = config.pagination.defaultPageSize,
    current = config.pagination.defaultStartPage,
  } = req.query;
  const limitNumber = parseInt(limit, 10);
  const currentNumber = parseInt(current, 10);

  const data = await MatchingPost.list({
    userId: req.user._id,
    limit: limitNumber,
    skip: (currentNumber - 1) * limitNumber,
  });
  await MatchingPost.markAllMatchRead({ user: req.user._id });
  res.json({
    total: await MatchingPost.countDocuments({
      match_users: { $in: [req.user._id] },
    }),
    limit: limitNumber,
    current: currentNumber,
    data,
  });
});

exports.getMatchPostCount = asyncHandler(async (req, res) => {
  const count = await MatchingPost.getUnreadMatchCount({ user: req.user._id });

  res.json({
    count,
  });
});
