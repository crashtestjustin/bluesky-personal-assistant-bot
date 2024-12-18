import {
  loadPreviousData,
  storeFollowersAndFollows,
} from "../data/readWriteFollowData.js";

export const compareFollowData = async (followData, targetUser) => {
  const pastData = loadPreviousData();
  const pastTargetData = pastData[targetUser[0].handle];

  const currentFollowers = followData.followers;
  const currentFollowing = followData.following;
  const pastFollowers = pastTargetData.followers;
  const pastFollowing = pastTargetData.follows;

  // Compare followers
  const newFollowers = currentFollowers.filter(
    (follower) => !pastFollowers.includes(follower)
  );
  const lostFollowers = pastFollowers.filter(
    (follower) => !currentFollowers.includes(follower)
  );

  // Compare following
  const newFollowing = currentFollowing.filter(
    (follow) => !pastFollowing.includes(follow)
  );
  const newUnFollows = pastFollowing.filter(
    (follow) => !currentFollowing.includes(follow)
  );

  //update the json with the latest data for next day's comparison
  storeFollowersAndFollows(
    targetUser[0].handle,
    followData.followers,
    followData.following
  );

  const returnData = {
    newFollowers,
    lostFollowers,
    newFollowing,
    newUnFollows,
  };

  return returnData;
};
