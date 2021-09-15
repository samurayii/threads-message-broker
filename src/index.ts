import * as worker_threads from "worker_threads";
import { IThreadsMessageBroker } from "./interfaces";
import { ThreadsMessageBrokerMaster } from "./lib/threads-message-broker-master";
import { ThreadsMessageBrokerSlave } from "./lib/threads-message-broker-slave";

export * from "./interfaces";

let Broker;

if (worker_threads.isMainThread === true) {
    Broker = ThreadsMessageBrokerMaster;
} else {
    Broker = ThreadsMessageBrokerSlave;
}

export const broker: IThreadsMessageBroker = new Broker();