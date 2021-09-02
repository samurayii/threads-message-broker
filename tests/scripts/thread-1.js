// eslint-disable-next-line @typescript-eslint/no-var-requires
const broker = require("../../dist/index").Broker;

setInterval( () => {
    console.log("thread-1 console");
}, 5000);

broker.subscribe("event:2", (data) => {
    console.log(`(event:2) ${data}`);
});

setTimeout( () => {
    broker.publish("event:2", "hello from worker1");
}, 7000);