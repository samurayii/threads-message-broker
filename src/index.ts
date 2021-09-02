import * as worker_threads from "worker_threads";
import { IThreadsMessageBroker } from "./interfaces";
import { ThreadsMessageBrokerMaster } from "./lib/threads-message-broker-master";
import { ThreadsMessageBrokerSlave } from "./lib/threads-message-broker-slave";

export * from "./interfaces";

let Broker: IThreadsMessageBroker;

if (worker_threads.isMainThread === true) {
    Broker = new ThreadsMessageBrokerMaster();
} else {
    Broker = new ThreadsMessageBrokerSlave();
}

export default Broker;

export {
    Broker
};