//function to get main post data for the day and send out a message that summarizes engagement
export async function sendAccountPostSummary(handle, session, accountPDS) {
  //GET posts as an array
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchPosts = async (url, actor) => {
    let cursor = null;

    // do {
    try {
      const params = new URLSearchParams({
        actor: actor,
        limit: "100",
        ...(cursor && { cursor }),
      });

      const response = await fetch(`${accountPDS}/xrpc/${url}?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.accessJwt}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error fetching ${url}: ${response.status} - ${errorData?.error}`
        );
      }

      const respData = await response.json();
      //   console.log(respData.feed[0]);

      const lastDay = new Date(Date.now() - 1000 * 60 * 60 * 24);

      const recentPosts = respData.feed.filter(
        (post) => post.post.author.createdAt >= lastDay
      );
      console.log(recentPosts);

      await delay(500); // Add delay to avoid rate limits
    } catch (error) {
      console.error(`Failed to fetch handles: ${error.message}`);
      // break; // Exit loop on failure
    }
    // } while (cursor);

    return;
  };

  const jdePosts = await fetchPosts("app.bsky.feed.getAuthorFeed", handle);

  //total up the posts engagement - likes, reposts, replies, number of posts
  //send a message that summarizes the information
}
