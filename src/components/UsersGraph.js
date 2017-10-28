import { h, Component } from "preact";
import {
  forceSimulation,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody
} from "d3-force";

export default class UsersGraph extends Component {
  componentDidMount() {
    const height = window.innerHeight;
    const { main, users } = this.props;
    const { offsetWidth: width } = this.el.parentElement;
    this.setState({ width, height });
    this.simulation = forceSimulation()
      .force("center", forceCenter(width / 2, height / 2))
      .force("charge", forceManyBody())
      .force("collision", forceCollide(d => d.r + 5))
      .force(
        "link",
        forceLink()
          .id(d => d.id)
          .distance(10)
      );
    this.simulation.on("tick", this.tickCallback);
    this.updateSimulation(main, users);
  }

  componentWillReceiveProps({ username, users }) {
    this.updateSimulation(username, users);
  }

  updateSimulation(main, users) {
    const center = {
      id: main,
      class: "color-blue",
      r: 15
    };
    const nodes = [
      center,
      ...users.map(user => ({
        id: user.id,
        r: 10,
        class: "color-light"
      }))
    ];
    const links = users
      .map(user => {
        return [
          {
            source: main,
            target: user.id,
            value: 0
          },
          ...(user.friends || [])
            .filter(friendId => {
              return users.find(u => u.id === friendId);
            })
            .map(friendId => ({
              source: friendId,
              target: user.id,
              value: 10
            }))
        ];
      })
      .reduce((all, cur) => all.concat(cur));
    this.simulation.nodes(nodes);
    this.simulation.force("link").links(links);
    this.setState({ nodes, links });
  }

  tickCallback = () => {
    if (this.state.nodes && !this.nextFrame) {
      this.nextFrame = requestAnimationFrame(() => {
        this.nextFrame = null;
        this.setState({
          // d3 mutates original objects
          nodes: this.state.nodes.slice()
        });
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
                <circle r={node.r} cx={node.x} cy={node.y} class={node.class} />
              </g>
            ))}
        </svg>
      </div>
    );
  }
}
