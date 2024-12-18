import { RichText } from "@atproto/api";
import { authenticateAgent } from "../authenticating/authenticateAgent.js";

export const sendUpdateMessage = async (
  convoId,
  accountPDS,
  proxyHeader,
  accessJwt,
  followChanges
) => {
  const agent = await authenticateAgent();
  const text = await messageText(followChanges, agent);

  const url = "chat.bsky.convo.sendMessage";

  try {
    const resp = await fetch(`${accountPDS}/xrpc/${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessJwt}`,
        "Atproto-Proxy": proxyHeader,
      },
      body: JSON.stringify({
        convoId: convoId,
        message: {
          text: text.text,
          facets: text.facets || [],
        },
      }),
    });

    const respsonse = await resp.json();
    if (resp.ok) {
      console.log("message sent successfully", respsonse);
    } else {
      console.log("issue sending messsage", respsonse);
    }
  } catch (error) {
    console.error("Error occurred while sending the message:", error);
  }
};

const messageText = async (followChanges, agent) => {
  const newFollowersString = followChanges.newFollowers
    .map((follower) => `@${follower}`)
    .join(", ");
  const newFollowingString = followChanges.newFollowing
    .map((following) => `@${following}`)
    .join(", ");
  const lostFollowersString = followChanges.lostFollowers
    .map((follower) => `@${follower}`)
    .join(", ");
  const lostFollowingString = followChanges.newUnFollows
    .map((following) => `@${following}`)
    .join(", ");
  const text = new RichText({
    text: `Hey Justin,\n\nHere's a summary of the connection changes over the last 24 hours:\n\nNew Followers: [${
      newFollowersString ? newFollowersString : "NONE🙅"
    }]\n\nNew Follows: [${
      newFollowingString ? newFollowingString : "NONE🙅"
    }]\n\nLost Followers: [${
      lostFollowersString ? lostFollowersString : "NONE🙅"
    }]\n\nUnfollowed Accounts: [${
      lostFollowingString ? lostFollowingString : "NONE🙅"
    }]`,
  });

  await text.detectFacets(agent);

  return text;
};
