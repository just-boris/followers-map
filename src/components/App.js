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
    const [user] = await twitter.userByName(this.state.username);
    const { ids } = await twitter.getFriends(user.id);
    const users = ids.map(id => ({ id }));
    this.setState({ userId: user.id, users });
    for (const user of users/*.slice(0, 4)*/) {
      const { ids } = await twitter.getFriends(user.id);
      this.updateUser(user.id, { friends: ids });
    }
  }

  updateUser(name, newData) {
    const { users } = this.state;
    this.setState({
      users: users.map(
        user => (user.id === name ? { ...user, ...newData } : user)
      )
    });
  }

  render() {
    const { users, userId } = this.state;
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
        {/* <div className="w-50">
          No list today
          <UsersList users={users} username={username} />
        </div> */}
        {/* <div className="w-50"> */}
        <UsersGraph users={users} main={userId} />
        {/* </div> */}
      </div>
    );
  }
}

export default App;
