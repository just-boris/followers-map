const fs = require("fs");
const path = require("path");
const Twitter = require("twit");
const client = new Twitter({
  consumer_key: "FFUuamGgKkXA5oHbNPtubQ",
  consumer_secret: "zTESbQPPM2FzYqUHvUV7lCIavQ6A0db74Pjn0W4N4",
  app_only_auth: true
});

const mocksFolder = path.resolve(__dirname, "../src/mocks");
const username = "boriscoder";

(async function() {
  const { data: [user] } = await client.get("users/lookup", {
    screen_name: username
  });
  const friends = await getFriends(user.id_str);
  for (const friend of friends) {
    const result = await getFriends(friend);
  }
})();

function cacheFile(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

async function getFriendsRemote(id) {
  const { data, resp } = await client.get("friends/ids", {
    id: id,
    stringify_ids: "true"
  });
  if (data.errors && data.errors.length > 0) {
    const [error] = data.errors;
    if (error.code === 88) {
      const resetTime = +resp.headers["x-rate-limit-reset"];
      throw new Error(`Rate limit. Retry at ${new Date(resetTime * 1000)}`);
    } else {
      throw new Error(`Could not load ${id}: ${data.errors[0].message}`);
    }
  }
  return data;
}

async function getFriends(id) {
  const filename = `${mocksFolder}/friends-ids-${id}.json`;
  try {
    const result = require(filename).ids;
    console.log("got from cache", id);
    return result;
  } catch (e) {
    const result = await getFriendsRemote(id);
    cacheFile(filename, result);
    console.log("write file", id);
    return result;
  }
}
