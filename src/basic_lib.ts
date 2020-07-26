import { NodeRuntime } from ".";

interface NumberNode extends NodeRuntime {
  out: {
    Value: string;
  };
}
const _NumberNode_out = {
  Value: "value",
};
export function NumberNode(value: number, name?: string) {
  let nt = new NodeRuntime(async (self) => {
    self.sendToPort("value", value);
  }, name) as NumberNode;
  nt.out = _NumberNode_out;
  return nt;
}

interface CalcNumNode extends NodeRuntime {
  in: { A: string; B: string };
  out: { Output: string };
}
const _CalcNumNode_in = {
  A: "A",
  B: "B",
};
const _CalcNumNode_out = {
  Output: "value",
};
export function CalcNumNode(
  calcType: "+" | "-" | "*" | "/" | "**",
  name?: string
) {
  let rt = new NodeRuntime(async (self: CalcNumNode) => {
    let from1 = (await self.getFromPortOptional(self.in.A)) || 0;
    let from2 = (await self.getFromPortOptional(self.in.B)) || 0;
    switch (calcType) {
      case "+":
        self.sendToPort(self.out.Output, Number(from1) + Number(from2));
        break;
      case "-":
        self.sendToPort(self.out.Output, Number(from1) - Number(from2));
        break;
      case "*":
        self.sendToPort(self.out.Output, Number(from1) * Number(from2));
        break;
      case "/":
        self.sendToPort(self.out.Output, Number(from1) / Number(from2));
        break;
      case "**":
        self.sendToPort(self.out.Output, Number(from1) ** Number(from2));
        break;
      default:
        throw "unknown operator: [node]";
    }
  }, name);
  let mt = rt as CalcNumNode;
  mt.in = _CalcNumNode_in;
  mt.out = _CalcNumNode_out;
  return mt;
}

interface OutputNode extends NodeRuntime {
  in: { Input: string };
}
const _OutputNode_in = { Input: "input" };
export function OutputNode(name?: string) {
  let nt = new NodeRuntime(async (self) => {
    let data = await self.getFromPort("input");
    console.log(data);
  }, name) as OutputNode;
  nt.in = _OutputNode_in;
  return nt;
}

interface ForLoopNode extends NodeRuntime {
  out: {
    index: string;
  };
}
const _ForP = { index: "index" };
/**
 * It works like: `let i = from; i < to; i++`
 * if to is undefined, it works like: `let i = 0; i < from; i++`
 * @param from like: `let i = from`
 * @param to like: `i < to`
 */
export function ForLoopNode(from: number, to?: number) {
  if (to === undefined) {
    to = from;
    from = 0;
  }
  let nt = new NodeRuntime(async (self) => {
    for (let index = from; index < to; index++) {
      self.sendToPort(nt.out.index, index);
      await self.waitPortUsed(nt.out.index);
    }
  }) as ForLoopNode;
  nt.out = _ForP;
  return nt;
}

export function TestForBody() {
  return new NodeRuntime(async (self) => {
    let index = await self.getFromPort("exec_signal");
    setTimeout(() => {
      console.log("hello" + index.toString());
    }, 1000);
  });
}
