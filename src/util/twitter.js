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

  async getFriends(username) {
    try {
      return require(`../mocks/friends-${username.toLowerCase()}.json`);
    } catch (e) {
      console.log(username, 'hyi');
      const response = await this.__call("friends_list", {
        screen_name: username
      });
      console.log(username);
      console.log(JSON.stringify(response));
      return response;
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
