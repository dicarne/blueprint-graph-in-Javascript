"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutPutNode = exports.addNewNode = exports.NodeRuntime = exports.GraphRuntime = void 0;
function newPort(tarnode, tarport) {
    return { targetNode: tarnode, targetPort: tarport };
}
class GraphConfig {
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
class GraphRuntime {
    constructor(name) {
        this.nodesCollection = new Map();
        this.addNewNode = (node) => {
            node.context = this;
            this.nodesCollection.set(node.name, node);
            return node;
        };
        this.run = () => {
            this.nodesCollection.forEach((v) => {
                v.run(v);
            });
        };
        this.name = name;
    }
}
exports.GraphRuntime = GraphRuntime;
class NodeRuntime {
    constructor(func, name) {
        this.isStarted = false;
        this.input_port = new Map();
        this.output_port = new Map();
        this.received = new Map();
        this.waitting = new Map();
        this.waitting_port_data_used = new Map();
        /**
         * Send data to Port
         * @param portName the output port name
         * @param value data
         */
        this.sendToPort = (portName, value) => {
            var _a;
            let target = this.output_port.get(portName);
            if (target) {
                for (let i = 0; i < target.length; i++) {
                    const p = target[i];
                    let tnode = (_a = this.context) === null || _a === void 0 ? void 0 : _a.nodesCollection.get(p.targetNode);
                    if (tnode) {
                        tnode._receiveData(p.targetPort, value);
                        if (tnode.isStarted === false) {
                            tnode.run(tnode);
                        }
                    }
                }
            }
        };
        this._receiveData = (portname, value) => {
            let try_getwait = this.waitting.get(portname);
            let dataqueue = this.received.get(portname);
            if (dataqueue === undefined)
                this.received.set(portname, [value]);
            else
                dataqueue.push(value);
            if (try_getwait) {
                try_getwait(value);
            }
        };
        this._tell_port_data_used = (portname) => {
            var _a;
            (_a = this.waitting_port_data_used.get(portname)) === null || _a === void 0 ? void 0 : _a();
        };
        /**
         * This node will pause until other node use the data in the port.
         * @param portname
         */
        this.waitPortUsed = (portname) => {
            return new Promise((resolve) => {
                this.waitting_port_data_used.set(portname, resolve);
            });
        };
        /**
         * Get data from port
         * @param portname the port name
         */
        this.getFromPort = (portname) => {
            return new Promise((resolve, reject) => {
                var _a, _b;
                let tryget = this.received.get(portname);
                let fromport = this.input_port.get(portname);
                if (fromport !== undefined) {
                    if (tryget !== undefined) {
                        let data = tryget.shift();
                        if (tryget.length === 0)
                            this.received.delete(portname);
                        (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.nodesCollection.get(fromport.targetNode)) === null || _b === void 0 ? void 0 : _b._tell_port_data_used(fromport.targetPort);
                        resolve(data);
                    }
                    else {
                        this.waitting.set(portname, (v) => {
                            var _a, _b;
                            let arr = this.received.get(portname);
                            if (!arr)
                                throw "端口未激活";
                            let data = arr.shift();
                            if (arr.length === 0)
                                this.received.delete(portname);
                            (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.nodesCollection.get(fromport.targetNode)) === null || _b === void 0 ? void 0 : _b._tell_port_data_used(fromport.targetPort);
                            resolve(v);
                        });
                    }
                }
                else {
                    throw "输入端口未激活";
                }
            });
        };
        /**
         * Get data from port
         * *(Null is returned when there is no link on the output port)*
         * @param portname the port name
         */
        this.getFromPortOptional = (portname) => {
            return new Promise((resolve, reject) => {
                var _a, _b;
                let tryget = this.received.get(portname);
                let fromport = this.input_port.get(portname);
                if (!!fromport) {
                    this.received.delete(portname);
                    (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.nodesCollection.get(fromport.targetNode)) === null || _b === void 0 ? void 0 : _b._tell_port_data_used(fromport.targetPort);
                    if (tryget) {
                        resolve(tryget);
                    }
                    else {
                        if (!this.input_port.has(portname)) {
                            resolve(null);
                        }
                        else {
                            this.waitting.set(portname, resolve);
                        }
                    }
                }
                else {
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
        this.linkTo = (myOutputPortName, anotherNode, inputPortName) => {
            let myport = this.output_port.get(myOutputPortName);
            let another_newport = newPort(anotherNode.name, inputPortName);
            if (!myport)
                this.output_port.set(myOutputPortName, [another_newport]);
            else
                myport.push(another_newport);
            anotherNode.input_port.set(inputPortName, newPort(this.name, myOutputPortName));
        };
        /**
         * Remove link between nodes.
         * @param portName
         */
        this.removeOutputLink = (portName) => {
            var _a;
            let port = this.output_port.get(portName);
            this.waitting_port_data_used.delete(portName);
            if (port) {
                this.output_port.delete(portName);
                for (let i = 0; i < port.length; i++) {
                    const p = port[i];
                    let anotherNode = (_a = this.context) === null || _a === void 0 ? void 0 : _a.nodesCollection.get(p.targetNode);
                    if (anotherNode) {
                        let ap = anotherNode.input_port.get(p.targetPort);
                        if (ap) {
                            anotherNode.input_port.delete(p.targetPort);
                        }
                    }
                }
            }
        };
        let r = (v) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            (_a = this.onBegin) === null || _a === void 0 ? void 0 : _a.call(this);
            try {
                v.isStarted = true;
                yield func(v);
                v.isStarted = false;
                (_b = this.onComplete) === null || _b === void 0 ? void 0 : _b.call(this);
                if (v.received.size !== 0) {
                    r(v);
                }
            }
            catch (error) {
                (_c = this.onError) === null || _c === void 0 ? void 0 : _c.call(this, error);
                return;
            }
        });
        this.run = r;
        this.name = name || graphConfig.generate_new_id();
    }
}
exports.NodeRuntime = NodeRuntime;
class PortData {
    constructor(d, callback) {
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
function addNewNode(context, nodeins) {
    return context.addNewNode(nodeins);
}
exports.addNewNode = addNewNode;
class OutPutNode_ extends NodeRuntime {
    constructor() {
        super(...arguments);
        this.in = { Input: "input" };
    }
}
/**
 * Output data to the outside of the graph.
 */
function OutPutNode() {
    let nt = new OutPutNode_((self) => __awaiter(this, void 0, void 0, function* () {
        self.Get = self.getFromPort(self.in.Input);
    }));
    return nt;
}
exports.OutPutNode = OutPutNode;
//# sourceMappingURL=index.js.map