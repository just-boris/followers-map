import { h } from "preact";

export default function UsersList({ username, users }) {
  return (
    <div className="pa3">
      <h1>@{username} follows</h1>
      {users.map(user => (
        <div className="flex flex-row-ns mb3">
          <div className="flex-none pr3">
            <img src={user.profile_image_url} class="br2" alt="avatar" />
          </div>
          <div>
            <a
              className="link blue"
              href={`https://twitter.com/${user.screen_name}`}
              target="_blank"
            >
              <b>{user.name}</b> <i>@{user.screen_name}</i>
            </a>
            <p>{user.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
