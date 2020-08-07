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

export const graphConfig = new GraphConfig();

export class GraphRuntime {
  nodesCollection = new Map<string, NodeRuntime<any>>();
  name?: string;
  constructor(name?: string) {
    this.name = name;
  }
  addNewNode = (node: NodeRuntime<any>): NodeRuntime<any> => {
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

export class NodeRuntime<T extends NodeRuntime<T>> {
  isStarted: boolean = false;
  onBegin?: () => void;
  onComplete?: () => void;
  onError?: (e: any) => void;
  context?: GraphRuntime;
  name: string;
  input_port: Map<string, port> = new Map<string, port>();
  output_port: Map<string, port[]> = new Map<string, port[]>();
  received: Map<string, any[]> = new Map<string, any[]>();
  waitting: Map<string, (v: any) => void> = new Map<string, (v: any) => void>();
  waitting_port_data_used: Map<string, () => void> = new Map<
    string,
    () => void
  >();
  /**
   * Run this Node
   */
  run: (self: T) => Promise<void>;
  constructor(func: (self: T) => Promise<void>, name?: string) {
    let r = async (v: T) => {
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
        this.onError?.(error);
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
      for (let i = 0; i < target.length; i++) {
        const p = target[i];
        let tnode = this.context?.nodesCollection.get(p.targetNode);
        if (tnode) {
          tnode._receiveData(p.targetPort, value);
          if (tnode.isStarted === false) {
            tnode.run(tnode);
          }
        }
      }
    }
  };
  _receiveData = (portname: string, value: any) => {
    let try_getwait = this.waitting.get(portname);
    let dataqueue = this.received.get(portname);
    if (dataqueue === undefined) this.received.set(portname, [value]);
    else dataqueue.push(value);
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
  getFromPort = <T>(portname: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      let tryget = this.received.get(portname);
      let fromport = this.input_port.get(portname);

      if (fromport !== undefined) {
        if (tryget !== undefined) {
          let data = tryget.shift();
          if (tryget.length === 0) this.received.delete(portname);
          this.context?.nodesCollection
            .get(fromport!.targetNode)
            ?._tell_port_data_used(fromport!.targetPort);
          resolve(data as T);
        } else {
          this.waitting.set(portname, (v) => {
            let arr = this.received.get(portname);
            if (!arr) throw "端口未激活";
            let data = arr.shift();
            if (arr.length === 0) this.received.delete(portname);
            this.context?.nodesCollection
              .get(fromport!.targetNode)
              ?._tell_port_data_used(fromport!.targetPort);
            resolve(v as T);
          });
        }
      } else {
        throw "输入端口未激活";
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
      if (!!fromport) {
        this.received.delete(portname);
        this.context?.nodesCollection
          .get(fromport!.targetNode)
          ?._tell_port_data_used(fromport!.targetPort);
        if (tryget) {
          resolve(tryget);
        } else {
          if (!this.input_port.has(portname)) {
            resolve(null);
          } else {
            this.waitting.set(portname, resolve);
          }
        }
      } else {
        throw "端口未激活";
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
    anotherNode: NodeRuntime<any>,
    inputPortName: string
  ) => {
    let myport = this.output_port.get(myOutputPortName);
    let another_newport = newPort(anotherNode.name, inputPortName);
    if (!myport) this.output_port.set(myOutputPortName, [another_newport]);
    else myport.push(another_newport);

    anotherNode.input_port.set(
      inputPortName,
      newPort(this.name, myOutputPortName)
    );
  };
  /**
   * Remove link between nodes.
   * @param portName
   */
  removeOutputLink = (portName: string) => {
    let port = this.output_port.get(portName);
    this.waitting_port_data_used.delete(portName);
    if (port) {
      this.output_port.delete(portName);
      for (let i = 0; i < port.length; i++) {
        const p = port[i];
        let anotherNode = this.context?.nodesCollection.get(p.targetNode);
        if (anotherNode) {
          let ap = anotherNode.input_port.get(p.targetPort);
          if (ap) {
            anotherNode.input_port.delete(p.targetPort);
          }
        }
      }
    }
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
export function addNewNode<T extends NodeRuntime<T>>(
  context: GraphRuntime,
  nodeins: T
): T {
  return context.addNewNode(nodeins) as T;
}

class OutPutNode_<T> extends NodeRuntime<OutPutNode_<T>> {
  Get?: Promise<T>;
  in = { Input: "input" };
}
/**
 * Output data to the outside of the graph.
 */
export function OutPutNode<T>() {
  let nt = new OutPutNode_<T>(async (self: OutPutNode_<T>) => {
    self.Get = self.getFromPort(self.in.Input);
  });
  return nt;
}
