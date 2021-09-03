// eslint-disable-next-line @typescript-eslint/no-var-requires
const broker = require("../../dist/index").Broker;

broker.subscribe("event:2", (data) => {
    console.log(`(event:2) ${data}`);
});

setTimeout( () => {
    process.exit();
}, 10000);