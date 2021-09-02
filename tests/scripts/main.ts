import * as worker_threads from "worker_threads";
import * as path from "path";
import { Broker as broker } from "../../src";

const worker1 = new worker_threads.Worker(path.resolve(__dirname, "./thread-1.js"), { 
    workerData: "{}",
    stderr: true,
    stdout: true,
    stdin: true
});

const worker2 = new worker_threads.Worker(path.resolve(__dirname, "./thread-2.js"), { 
    workerData: "{}",
    stderr: true,
    stdout: true,
    stdin: true
});

broker.addThread("worker1", worker1);
broker.addThread("worker2", worker2);

broker.subscribe("event:2", (data: string) => {
    console.log(`[main] (event:2) ${data}`);
});

worker1.stderr.on("data", (data) => {
    console.error(`[worker1] ${data.toString().trim()}`);
});

worker1.stdout.on("data", (data) => {
    console.log(`[worker1] ${data.toString().trim()}`);
});

worker1.on("error", (error) => {
    console.error(`[worker1] Process error. ${error}`);
    console.log(error.stack, "debug");
});

worker1.on("exit", (code) => {
    console.error(`[worker1] Closed with code ${code}`);
});

worker1.on("online", () => {
    console.log("[worker1] Started");
});

worker2.stderr.on("data", (data) => {
    console.error(`[worker2] ${data.toString().trim()}`);
});

worker2.stdout.on("data", (data) => {
    console.log(`[worker2] ${data.toString().trim()}`);
});

worker2.on("error", (error) => {
    console.error(`[worker2] Process error. ${error}`);
    console.log(error.stack, "debug");
});

worker2.on("exit", (code) => {
    console.error(`[worker2] Closed with code ${code}`);
});

worker2.on("online", () => {
    console.log("[worker2] Started");
});

setTimeout( () => {
    //broker.publish("event:1", "hello1 from main");
    //broker.publish("event:2", "hello2 from main");
}, 3000);