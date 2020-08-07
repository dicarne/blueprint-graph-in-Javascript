import { NodeRuntime } from ".";

class NumberNode_ extends NodeRuntime<NumberNode_> {
  out = {
    Value: "value",
  };
}

export function NumberNode(value: number, name?: string) {
  let nt = new NumberNode_(async (self: NumberNode_) => {
    self.sendToPort("value", value);
  }, name);
  return nt;
}

class CalcNumNode_ extends NodeRuntime<CalcNumNode_> {
  in = { A: "A", B: "B" };
  out = { Output: "value" };
}

export function CalcNumNode(
  calcType: "+" | "-" | "*" | "/" | "**",
  name?: string
) {
  let rt = new CalcNumNode_(async (self: CalcNumNode_) => {
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

  return rt;
}

class LogNode_ extends NodeRuntime<LogNode_> {
  in = { Input: "input" };
}
const _LogNode_in = { Input: "input" };
export function LogNode(name?: string) {
  let nt = new LogNode_(async (self: LogNode_) => {
    let data = await self.getFromPort("input");
    console.log(data);
  }, name);
  return nt;
}

class ForLoopNode_ extends NodeRuntime<ForLoopNode_> {
  out = {
    index: "index",
  };
}
/**
 * It works like: `let i = from; i < to; i++`
 * if to is undefined, it works like: `let i = 0; i < from; i++`
 * @param from like: `let i = from`
 * @param to like: `i < to`
 */
export function ForLoopNode(from: number, to?: number) {
  let too = 0;
  if (to === undefined) {
    too = from;
    from = 0;
  } else {
    too = to;
  }
  let nt = new ForLoopNode_(async (self: ForLoopNode_) => {
    for (let index = from; index < too; index++) {
      self.sendToPort(self.out.index, index);
      await self.waitPortUsed(self.out.index);
    }
  });
  return nt;
}

export function TestForBody() {
  return new NodeRuntime(async (self) => {
    let index = await self.getFromPort<any>("exec_signal");
    setTimeout(() => {
      console.log("hello" + index.toString());
    }, 1000);
  });
}
