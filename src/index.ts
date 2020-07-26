interface port {
  targetNode: string;
  targetPort: string;
}

function newPort(tarnode: string, tarport: string): port {
  return { targetNode: tarnode, targetPort: tarport };
}

class GraphConfig {
  index: number;
  generate_new_id: () => string;
  constructor() {
    this.index = 0;
    this.generate_new_id = () => {
      let r = this.index.toString();
      this.index++;
      return r;
    };
  }
}

const graphConfig = new GraphConfig();

export class GraphRuntime {
  nodesCollection = new Map<string, NodeRuntime>();
  name?: string;
  constructor(name?: string) {
    this.name = name;
  }
  addNewNode = (node: NodeRuntime): NodeRuntime => {
    node.context = this;
    this.nodesCollection.set(node.name, node);
    return node;
  };
  run = () => {
    this.nodesCollection.forEach((v) => {
      v.run(v);
    });
  };
}

export class NodeRuntime {
  isStarted: boolean;
  onBegin?: () => void;
  onComplete?: () => void;
  onError?: (e: any) => void;
  context: GraphRuntime;
  name: string;
  input_port: Map<string, port> = new Map<string, port>();
  output_port: Map<string, port> = new Map<string, port>();
  received: Map<string, any> = new Map<string, any>();
  waitting: Map<string, (v: any) => void> = new Map<string, (v: any) => void>();
  waitting_port_data_used: Map<string, () => void> = new Map<
    string,
    () => void
  >();
  /**
   * Run this Node
   */
  run: (self: NodeRuntime) => Promise<void>;
  constructor(func: (self: NodeRuntime) => Promise<void>, name?: string) {
    let r = async (v: NodeRuntime) => {
      this.onBegin?.();
      try {
        v.isStarted = true;
        await func(v);
        v.isStarted = false;
        this.onComplete?.();
        if (v.received.size !== 0) {
          r(v);
        }
      } catch (error) {
        this.onError(error);
        return;
      }
    };
    this.run = r;
    this.name = name || graphConfig.generate_new_id();
  }
  /**
   * Send data to Port
   * @param portName the output port name
   * @param value data
   */
  sendToPort = (portName: string, value: any) => {
    let target = this.output_port.get(portName);
    if (target) {
      let tnode = this.context.nodesCollection.get(target.targetNode);
      if (tnode) {
        tnode._receiveData(target.targetPort, value);
        if (tnode.isStarted === false) {
          tnode.run(tnode);
        }
      }
    }
  };
  _receiveData = (portname: string, value: any) => {
    let try_getwait = this.waitting.get(portname);
    this.received.set(portname, value);
    if (try_getwait) {
      try_getwait(value);
    }
  };
  _tell_port_data_used = (portname: string) => {
    this.waitting_port_data_used.get(portname)?.();
  };
  /**
   * This node will pause until other node use the data in the port.
   * @param portname 
   */
  waitPortUsed = (portname: string): Promise<void> => {
    return new Promise((resolve) => {
      this.waitting_port_data_used.set(portname, resolve);
    });
  };
  /**
   * Get data from port
   * @param portname the port name
   */
  getFromPort = (portname: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      let tryget = this.received.get(portname);
      let fromport = this.input_port.get(portname);

      if (tryget !== undefined) {
        this.received.delete(portname);
        this.context.nodesCollection
          .get(fromport.targetNode)
          ?._tell_port_data_used(fromport.targetPort);
        resolve(tryget);
      } else {
        this.waitting.set(portname, (v) => {
          this.received.delete(portname);
          this.context.nodesCollection
            .get(fromport.targetNode)
            ?._tell_port_data_used(fromport.targetPort);
          resolve(v);
        });
      }
    });
  };

  /**
   * Get data from port
   * *(Null is returned when there is no link on the output port)*
   * @param portname the port name
   */
  getFromPortOptional = (portname: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      let tryget = this.received.get(portname);
      let fromport = this.input_port.get(portname);
      this.received.delete(portname);
      this.context.nodesCollection
        .get(fromport.targetNode)
        ?._tell_port_data_used(fromport.targetPort);
      if (tryget) {
        resolve(tryget);
      } else {
        if (!this.input_port.has(portname)) {
          resolve(null);
        } else {
          this.waitting.set(portname, resolve);
        }
      }
    });
  };
  /**
   * Link output port to another node.
   * @param myOutputPortName
   * @param anotherNode
   * @param inputPortName
   */
  linkTo = (
    myOutputPortName: string,
    anotherNode: NodeRuntime,
    inputPortName: string
  ) => {
    this.output_port.set(
      myOutputPortName,
      newPort(anotherNode.name, inputPortName)
    );
    anotherNode.input_port.set(
      inputPortName,
      newPort(this.name, myOutputPortName)
    );
  };
}

class PortData<T> {
  data: T;
  usedCallback?: () => void;
  constructor(d: T, callback?: () => void) {
    this.data = d;
    this.usedCallback = callback;
  }
}

/**
 * Add a new node to the graph.
 * (for typescript.)
 * @param context the graph
 * @param nodeins the node
 */
export function addNewNode<T extends NodeRuntime>(
  context: GraphRuntime,
  nodeins: T
): T {
  return context.addNewNode(nodeins) as T;
}
