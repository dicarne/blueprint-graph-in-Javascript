# Blueprint-Graph-in-Javascript

Create nodes, join the graph, wait for the result. Just like Blueprint. Asynchronous for everythings.

## What's this for?

Help you write Javascript code like Unreal blueprint.  
Uhh, may be you need a beautiful UI.

All source codes useful were in `src/index.ts`.

And `src/example.ts` is an example for use, `basic_lib.ts` is an example for writting an library.

## How to use it?

First of all, create a graph.

```javascript
let ctx = new GraphRuntime();
```

Then create some nodes with initial value.

```javascript
let node1 = addNewNode(ctx, NumberNode(2));
let node2 = addNewNode(ctx, NumberNode(4));
let nodemmul = addNewNode(ctx, CalcNumNode("**"));
let show = addNewNode(ctx, OutputNode());
```

Tell graph the connections between nodes.

```javascript
node1.linkTo(node1.out.Value, nodemmul, nodemmul.in.A);
node2.linkTo(node2.out.Value, nodemmul, nodemmul.in.B);
nodemmul.linkTo(nodemmul.out.Output, show, show.in.Input);
```

Finally run the graph.

```javascript
ctx.run();
```

And you get the result:`16`.

The code above is equivalent to:

```javascript
console.log(2 ** 4);
```

## How to create your own node?

A custom node is like this:

```typescript
function CustomNode(name?: string) {
  return new NodeRuntime(async (self) => {

    // begin your code
    let data1 = await self.getFromPort("input_data_1");
    setTimeout(async () => {
      let data2 = await self.getFromPortOptional("input_data_2");
      /**do some calculation */
      let result = data1.toString() + (data2 || 0).toString();
      self.sendToPort("my_output_port", result);
    }, 1000);

    // end your code
  });
}
```

You can get data by port name, if the data is not prepared, your node will wait until the data arrived.

Also, write some wrappers to help you remember port names.

These codes show how to use for loop in graph.

```typescript
let fornode = addNewNode(ctx, ForLoopNode(5));
let testnode = addNewNode(ctx, TestForBody());
fornode.linkTo(fornode.out.index, testnode, "exec_signal");
```
Then we will get: 
```
hello0
hello1
hello2
hello3
hello4
```

## When will nodes run?
* When graph begin.
* When someone push data to a completed node.
* When some remain data is found when it completed.

## Why do you make things complicated?

Uhh, I don't know. Just for fun.
