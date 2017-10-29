import { h, Component } from "preact";
import { forceSimulation, forceCenter, forceCollide, forceLink, forceManyBody } from "d3-force";

function Links({ links }) {
  if (!links) {
    return null;
  }
  return (
    <g>
      {links.map(
        ({ value, source, target }) =>
          value > 0 && (
            <g>
              <line
                style={{ stroke: "gray" }}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
              />
            </g>
          )
      )}
    </g>
  );
}

function Nodes({ nodes }) {
  if (!nodes) {
    return null;
  }
  return (
    <g>
      {nodes.map(node => (
        <g>
          <title>{node.id}</title>
          <circle r={node.r} cx={node.x} cy={node.y} class={node.class} />
        </g>
      ))}
    </g>
  );
}

export default class UsersGraph extends Component {
  componentDidMount() {
    const height = window.innerHeight;
    const { main, users } = this.props;
    const { offsetWidth: width } = this.el.parentElement;
    this.setState({ width, height });
    this.simulation = forceSimulation()
      .force("center", forceCenter(width / 2, height / 2))
      .force("charge", forceManyBody().strength(-80))
      .force("collision", forceCollide(d => d.r))
      .force("link", forceLink().id(d => d.id));
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
              value: 5
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

  onMouseDown = event => {
    const { offsetX, offsetY } = event;
    this.draggedItem = this.simulation.find(offsetX, offsetY);
    this.simulation.alphaTarget(0.3).restart();
  };

  onMouseMove = event => {
    if (this.draggedItem) {
      const { offsetX, offsetY } = event;
      this.draggedItem.fx = offsetX;
      this.draggedItem.fy = offsetY;
    }
  };

  onMouseUp = () => {
    this.draggedItem.fx = null;
    this.draggedItem.fy = null;
    this.draggedItem = false;
    this.simulation.alphaTarget(0);
  };

  render() {
    const { nodes, links, height, width } = this.state;
    return (
      <div
        ref={el => (this.el = el)}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
      >
        <svg style={{ height, width }}>
          <Links links={links} />
          <Nodes nodes={nodes} />
        </svg>
      </div>
    );
  }
}
