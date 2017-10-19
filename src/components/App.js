import { h, Component } from "preact";
import UsersList from "./UsersList";
import UsersGraph from "./UsersGraph";
import Twitter from "../util/twitter";

const twitter = new Twitter();

class App extends Component {
  constructor() {
    super();
    this.state = {
      username: "boriscoder"
    };
  }

  async componentDidMount() {
    await twitter.initialize();
    const { users } = await twitter.getFriends(this.state.username);
    this.setState({ users });
    for (const user of users) {
      const { users } = await twitter.getFriends(user.screen_name);
      this.updateUser(user.screen_name, { friends: users });
    }
  }

  updateUser(name, newData) {
    const { users } = this.state;
    this.setState({
      users: users.map(
        user => (user.screen_name === name ? { ...user, ...newData } : user)
      )
    });
  }

  render() {
    const { users, username } = this.state;
    if (!users) {
      return (
        <div className="vh-100 bg-washed-blue">
          <div className="pa5">
            <h2 className="f2">Loading...</h2>
          </div>
        </div>
      );
    }
    return (
      <div className="flex">
        <div className="w-50">
          <UsersList users={users} username={username} />
        </div>
        <div className="w-50">
          <UsersGraph users={users} username={username} />
        </div>
      </div>
    );
  }
}

export default App;
