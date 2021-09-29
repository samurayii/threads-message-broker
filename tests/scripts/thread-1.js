// eslint-disable-next-line @typescript-eslint/no-var-requires
const { broker } = require("../../dist/index");

setInterval( () => {
    console.log("thread-1 console");
}, 5000);

broker.subscribe("event:2", (data) => {
    console.log(`(event:2) ${data}`);
});
broker.subscribe("trigger:1", () => {
    console.log("(trigger:1) >>>>>>>");
});

setTimeout( () => {
    broker.publish("event:2", "hello from worker1");
    broker.publish("event:2", "hello from worker1 (hide)", true);
    broker.trigger("trigger:1");
    broker.trigger("trigger:1", true);
}, 7000);