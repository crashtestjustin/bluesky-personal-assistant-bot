import fetch, { Headers, Response, Request } from "node-fetch"; // Polyfill fetch, Headers, Response, and Request
import { FormData } from "formdata-node"; // Polyfill FormData

// Polyfill fetch, Headers, FormData, Request, and Response for the Node.js environment
globalThis.Headers = Headers;
globalThis.fetch = fetch;
globalThis.FormData = FormData;
globalThis.Response = Response;
globalThis.Request = Request;

import dotenv from "dotenv";
import cron from "node-cron";
import { authenticateAgent } from "./authenticating/authenticateAgent.js";
import { createSession } from "./authenticating/createSession.js";
import { getPersonalBotConvo } from "./matching and getting data/findMatchingConvo.js";
import { compareFollowData } from "./matching and getting data/compareToPriorFollowData.js";
import { getFollowersAndFollowingHandles } from "./data/getFollowerandFollowingHandles.js";
import { sendUpdateMessage } from "./sendingMessage/sendSummary.js";
import { loadHandles } from "./data/readWriteHandles.js";

dotenv.config();

export const run = async () => {
  const session = await createSession();
  const accountPDS = session.service[0].serviceEndpoint;
  const listConvosUrl = "chat.bsky.convo.listConvos";
  const proxyHeader = "did:web:api.bsky.chat#bsky_chat";

  try {
    //get conversations in chat for crashtestjustin account
    const resp = await fetch(`${accountPDS}/xrpc/${listConvosUrl}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.accessJwt}`,
        "Atproto-Proxy": "did:web:api.bsky.chat#bsky_chat",
      },
    });
    const data = await resp.json();
    //get the chat where the participants are only ctj and jde.blue
    const conversation = getPersonalBotConvo(data.convos);
    //get the follower and following data for the main account
    //Get the handle of the user to target followData queries
    const targetUser = conversation.convo.members.filter(
      (handle) => handle !== "crashtestjustin.bsky.social"
    );

    //create handle array for subsequent actions
    const otherHandles = loadHandles();
    const handles = [...otherHandles.handles, targetUser[0].handle];
    // console.log("All handles", handles);

    //get follows and followers
    const followData = await getFollowersAndFollowingHandles(
      accountPDS,
      session.accessJwt,
      handles
    );

    // console.log(followData);
    // //get prior informatino from database (aka json file for now)
    const difference = await compareFollowData(followData, handles);
    console.log(difference);
    // //send message summarizing changes to the same conversation id
    // const message = await sendUpdateMessage(
    //   targetUser[0].handle,
    //   conversation.convo.id,
    //   accountPDS,
    //   proxyHeader,
    //   session.accessJwt,
    //   difference
    // );
  } catch (error) {
    console.log("Error sending message", error);
  }
};

run().catch(console.error);
