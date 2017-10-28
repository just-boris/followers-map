import Codebird from "codebird";

export default class Twitter {
  constructor() {
    this.cb = new Codebird();
    this.cb.setConsumerKey(
      "FFUuamGgKkXA5oHbNPtubQ",
      "zTESbQPPM2FzYqUHvUV7lCIavQ6A0db74Pjn0W4N4"
    );
  }

  initialize() {
    return this.__call("oauth2_token");
  }

  userByName(username) {
    return this.__call("users_lookup", {
      screen_name: username
    });
  }

  async getFriends(id) {
    try {
      return await import(`../mocks/friends-ids-${id}.json`);
    } catch (e) {
      return {};
      // const response = await this.__call("friends_ids", {
      //   user_id: id,
      //   stringify_ids: 'true'
      // });
      // console.log(id);
      // console.log(JSON.stringify(response));
      // return response;
    }
  }

  __call(method, opts) {
    return new Promise((resolve, reject) => {
      this.cb.__call(method, opts, (reply, rate, err) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }
}
