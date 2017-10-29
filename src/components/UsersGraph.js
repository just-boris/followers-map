import { h, Component } from "preact";
import { forceSimulation, forceCenter, forceCollide, forceLink, forceManyBody } from "d3-force";

function forceExtent(maxX, maxY) {
  let nodes;

  function force() {
    for (const node of nodes) {
      const r = node.r;
      node.x = Math.max(Math.min(node.x, maxX - r), r);
      node.y = Math.max(Math.min(node.y, maxY -r), r);
    }
  }

  force.initialize = _ => (nodes = _);

  return force;
}

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
                style={{ stroke: "#ccc" }}
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
        <g transform={`translate(${node.x - node.r}, ${node.y - node.r})`}>
          <circle r={node.r} cx={node.r} cy={node.r} class={node.class} />
          <text dy="-1" dx={node.r} textAnchor="middle" fontSize="8">
            {node.screen_name}
          </text>
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
      .force("bounds", forceExtent(width, height))
      .force("collision", forceCollide(d => d.r))
      .force("link", forceLink().id(d => d.id));
    this.simulation.on("tick", this.tickCallback);
    const center = {
      id: main,
      screen_name: "Your account",
      class: "color-blue",
      r: 15
    };
    const nodes = [
      center,
      ...users.map(user => ({
        ...user,
        r: 10,
        class: "color-light"
      }))
    ];
    const links = users
      .map(user => {
        return [
          // {
          //   source: main,
          //   target: user.id,
          //   value: 0
          // },
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
    this.setState({
      draggedItem: this.simulation.find(offsetX, offsetY)
    });
    this.simulation.alphaTarget(0.3).restart();
  };

  onMouseMove = event => {
    const { draggedItem } = this.state;
    if (draggedItem) {
      draggedItem.fx = event.offsetX;
      draggedItem.fy = event.offsetY;
    }
  };

  onMouseUp = () => {
    const { draggedItem } = this.state;
    draggedItem.fx = null;
    draggedItem.fy = null;
    this.simulation.alphaTarget(0);
    this.setState({ draggedItem: null });
  };

  render() {
    const { nodes, links, height, width, draggedItem } = this.state;
    return (
      <div
        ref={el => (this.el = el)}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
      >
        <svg style={{ height, width, userSelect: draggedItem ? "none" : "" }}>
          <Links links={links} />
          <Nodes nodes={nodes} />
        </svg>
      </div>
    );
  }
}
