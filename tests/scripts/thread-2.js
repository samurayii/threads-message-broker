// eslint-disable-next-line @typescript-eslint/no-var-requires
const { broker } = require("../../dist/index");

broker.subscribe("event:2", (data) => {
    console.log(`(event:2) ${data}`);
});

broker.subscribe("trigger:1", () => {
    console.log("(trigger:1) !!!!!!!!!!!!!!!");
});

setTimeout( () => {
    process.exit();
}, 10000);