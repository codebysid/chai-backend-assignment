import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { _id } = req.user;
  // TODO: toggle subscription
  if (!channelId || !_id) return new ApiError(404, "channel id not found");
  const subscribeTo = await User.findOne({ _id: channelId });
  if (!subscribeTo) return new ApiError(404, "channel id invalid");
  const existingSubscription = await Subscription.findOne({
    subscriber: _id,
    channel: channelId,
  });
  if (existingSubscription) {
    await Subscription.findOneAndDelete({
      subscriber: _id,
      channel: channelId,
    });
    return res
      .status(201)
      .json(new ApiResponse(200, null, "unsubscribed successfully"));
  } else {
    const data = await Subscription.create(
      {
        subscriber: _id,
        channel: channelId,
      },
      { new: true }
    );
    return res
      .status(201)
      .json(new ApiResponse(200, data, "Subscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) return new ApiError(404, "subscriber id not found");
  const channelList = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel_details",
      },
    },
    {
      $unwind: "$channel_details",
    },
  ]);
  if (!channelList) return new ApiError(404, "channel id is invalid");
  return res
    .status(200)
    .json(
      new ApiResponse(200, channelList, "subscriber list fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) return new ApiError(404, "channel id not found");
  const subscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber_details",
      },
    },
    {
      $unwind: "$subscriber_details",
    },
    {
      $group: {
        _id: null,
        totalNumberOfSubscribers: { $sum: 1 },
        subscribers: { $push: "$subscriber_details" },
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, subscriberList, "all subscribers"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
