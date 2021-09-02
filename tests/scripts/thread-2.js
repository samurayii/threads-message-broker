// eslint-disable-next-line @typescript-eslint/no-var-requires
const broker = require("../../dist/index").Broker;

broker.subscribe("event:2", (data) => {
    console.log(`(event:2) ${data}`);
});

setInterval( () => {
    console.log("thread-2 console");
}, 5000);

setTimeout( () => {
    //broker.unsubscribe(id_sub1);
    //broker.unsubscribe(id_sub2);
}, 7000);