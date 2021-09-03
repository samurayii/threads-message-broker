// eslint-disable-next-line @typescript-eslint/no-var-requires
const broker = require("../../dist/index").Broker;

broker.subscribe("event:2", (data) => {
    console.log(`(event:2) ${data}`);
});

setInterval( () => {
    console.log("thread-3 console");
}, 5000);

setTimeout( () => {
    broker.publish("event:2", "hello from worker3");
    broker.publish("event:2", "hello from worker3 (hide)", true);
}, 3000);