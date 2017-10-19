import { h, Component } from "preact";
import {
  forceSimulation,
  forceCenter,
  forceCollide,
  forceLink
} from "d3-force";

export default class UsersGraph extends Component {
  componentDidMount() {
    const height = window.innerHeight;
    const { username, users } = this.props;
    const { offsetWidth: width } = this.el.parentElement;
    this.setState({ width, height });
    this.simulation = forceSimulation()
      .force("center", forceCenter(width / 2, height / 2))
      .force("collision", forceCollide(d => d.r + 5))
      .force("link", forceLink().id(d => d.id));
    this.simulation.on("tick", this.tickCallback);
    this.updateSimulation(username, users);
  }

  componentWillReceiveProps({username, users}) {
    this.updateSimulation(username, users);
  }

  updateSimulation(username, users) {
    const main = {
      id: username,
      textColor: "4682b4",
      background: "357edd",
      r: 15
    };
    const nodes = [
      main,
      ...users.map(user => ({
        id: user.screen_name,
        r: 10,
        textColor: user.profile_text_color,
        background: user.profile_background_color
      }))
    ];
    const links = users
      .map(user => {
        return [
          {
            source: username,
            target: user.screen_name,
            value: 2
          },
          ...(user.friends || [])
            .filter(f => {
              return users.find(u => u.screen_name === f.screen_name);
            })
            .map(friend => ({
              source: friend.screen_name,
              target: user.screen_name,
              value: 2
            }))
        ];
      })
      .reduce((all, cur) => all.concat(cur));
    this.simulation.nodes(nodes);
    this.simulation.force("link").links(links);
    this.setState({ nodes, links });
    // this.simulation.restart();
  }

  tickCallback = () => {
    if (this.state.nodes) {
      this.setState({
        // d3 mutates original objects
        nodes: this.state.nodes.slice()
      });
    }
  };

  render() {
    const { nodes, links, height, width } = this.state;
    return (
      <div ref={el => (this.el = el)}>
        <svg style={{ height, width }}>
          {links &&
            links.map(link => (
              <g>
                <line
                  style={{ stroke: "gray" }}
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                />
              </g>
            ))}
          {nodes &&
            nodes.map(node => (
              <g>
                <title>{node.id}</title>
                <circle
                  r={node.r}
                  cx={node.x}
                  cy={node.y}
                  style={{
                    fill: `#${node.background}`,
                    stroke: `#${node.textColor}`
                  }}
                />
              </g>
            ))}
        </svg>
      </div>
    );
  }
}
