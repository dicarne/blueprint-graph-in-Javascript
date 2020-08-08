interface port {
    targetNode: string;
    targetPort: string;
}
declare class GraphConfig {
    index: number;
    generate_new_id: () => string;
    constructor();
}
export declare const graphConfig: GraphConfig;
export declare class GraphRuntime {
    nodesCollection: Map<string, NodeRuntime<any>>;
    name?: string;
    constructor(name?: string);
    addNewNode: (node: NodeRuntime<any>) => NodeRuntime<any>;
    run: () => void;
}
export declare class NodeRuntime<T extends NodeRuntime<T>> {
    isStarted: boolean;
    onBegin?: () => void;
    onComplete?: () => void;
    onError?: (e: any) => void;
    context?: GraphRuntime;
    name: string;
    input_port: Map<string, port>;
    output_port: Map<string, port[]>;
    received: Map<string, any[]>;
    waitting: Map<string, (v: any) => void>;
    waitting_port_data_used: Map<string, () => void>;
    /**
     * Run this Node
     */
    run: (self: T) => Promise<void>;
    constructor(func: (self: T) => Promise<void>, name?: string);
    /**
     * Send data to Port
     * @param portName the output port name
     * @param value data
     */
    sendToPort: (portName: string, value: any) => void;
    _receiveData: (portname: string, value: any) => void;
    _tell_port_data_used: (portname: string) => void;
    /**
     * This node will pause until other node use the data in the port.
     * @param portname
     */
    waitPortUsed: (portname: string) => Promise<void>;
    /**
     * Get data from port
     * @param portname the port name
     */
    getFromPort: <T_1>(portname: string) => Promise<T_1>;
    /**
     * Get data from port
     * *(Null is returned when there is no link on the output port)*
     * @param portname the port name
     */
    getFromPortOptional: (portname: string) => Promise<any>;
    /**
     * Link output port to another node.
     * @param myOutputPortName
     * @param anotherNode
     * @param inputPortName
     */
    linkTo: (myOutputPortName: string, anotherNode: NodeRuntime<any>, inputPortName: string) => void;
    /**
     * Remove link between nodes.
     * @param portName
     */
    removeOutputLink: (portName: string) => void;
}
/**
 * Add a new node to the graph.
 * (for typescript.)
 * @param context the graph
 * @param nodeins the node
 */
export declare function addNewNode<T extends NodeRuntime<T>>(context: GraphRuntime, nodeins: T): T;
export declare class OutPutNode<T> extends NodeRuntime<OutPutNode<T>> {
    Get: Promise<T>;
    in: {
        input: string;
    };
    constructor();
}
export declare class InputNode<T> extends NodeRuntime<InputNode<T>> {
    out: {
        output: string;
    };
    constructor(data: T);
}
export {};
