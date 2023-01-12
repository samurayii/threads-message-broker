import { IThreadsMessageBroker, IThreadsMessageBrokerMessage, IThreadsMessageBrokerSubscriber } from "../interfaces";
import { Worker } from "worker_threads";
import * as worker_threads from "worker_threads";
import { v4 as uuid } from "uuid";
import { ThreadsMessageBrokerLocalSubscriber } from "./threads-message-broker-local-subscriber";
import { ThreadsMessageBrokerThreadSubscriber } from "./threads-message-broker-thread-subscriber";

export class ThreadsMessageBrokerMaster implements IThreadsMessageBroker {

    private readonly _threads_list: {
        [key: string]: Worker
    }
    private readonly _subscribers_list: {
        [key: string]: {
            [key: string]: IThreadsMessageBrokerSubscriber
        }
    }

    constructor () {

        if (worker_threads.isMainThread === false) {
            throw new Error("Thread is not main");
        }

        this._threads_list = {};
        this._subscribers_list = {};
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    subscribe (event_name: string, fn: Function): string {

        if (this._subscribers_list[event_name] === undefined) {
            this._subscribers_list[event_name] = {};
        }

        const id = uuid();
        const subscriber = new ThreadsMessageBrokerLocalSubscriber(id, event_name, fn);

        this._subscribers_list[event_name][id] = subscriber;

        return `${event_name}${id}`;

    }

    unsubscribe (id_subscriber: string): void {

        const id = id_subscriber.substring(id_subscriber.length-36, id_subscriber.length);
        const event_name = id_subscriber.replace(id, "");

        if (this._subscribers_list[event_name] !== undefined) {
            delete this._subscribers_list[event_name][id];
            if (Object.keys(this._subscribers_list[event_name]).length <= 0) {
                delete this._subscribers_list[event_name];
            }
        }

    }

    addThread (worker_name: string, worker: Worker): void {
        
        if (this._threads_list[worker_name] !== undefined) {
            throw new Error(`Worker ${worker_name} already exist`);
        }

        this._threads_list[worker_name] = worker;

        worker.on("error", () => {
            this._delete_worker(worker_name);
        });

        worker.on("exit", () => {
            this._delete_worker(worker_name);
        });

        worker.on("message", (data: string) => {
           
            const message: IThreadsMessageBrokerMessage = JSON.parse(data);

            message.worker = worker_name;

            if (message.command === "publish") {

                if (this._subscribers_list[message.event] === undefined) {
                    return;
                }
      
                for (const id_subscriber in this._subscribers_list[message.event]) {
                    const subscriber = this._subscribers_list[message.event][id_subscriber];
                    if (subscriber.worker !== worker_name) {
                        subscriber.emit("publish", message.data);
                    }
                }

            }

            if (message.command === "trigger") {

                if (this._subscribers_list[message.event] === undefined) {
                    return;
                }
      
                for (const id_subscriber in this._subscribers_list[message.event]) {
                    const subscriber = this._subscribers_list[message.event][id_subscriber];
                    if (subscriber.worker !== worker_name) {
                        subscriber.emit("trigger");
                    }
                }

            }

            if (message.command === "subscribe") {

                if (this._subscribers_list[message.event] === undefined) {
                    this._subscribers_list[message.event] = {};
                }
        
                const subscriber = new ThreadsMessageBrokerThreadSubscriber(message.id_subscriber, message.event, worker_name, worker);
        
                this._subscribers_list[message.event][message.id_subscriber] = subscriber;

            }

            if (message.command === "unsubscribe") {
                this.unsubscribe(`${message.event}${message.id_subscriber}`);
            }
            
        });

    }

    removeThread (worker_name: string): void {
        if (this._threads_list[worker_name] === undefined) {
            return;
        }
        this._delete_worker(worker_name);
    }

    private _delete_worker (worker_name: string): void {

        this._threads_list[worker_name].removeAllListeners();
        delete this._threads_list[worker_name];

        for (const event_name in this._subscribers_list) {

            const subscribers = this._subscribers_list[event_name];

            for (const id_subscriber in subscribers) {
                const subscriber = subscribers[id_subscriber];
                if (subscriber.worker === worker_name) {
                    delete this._subscribers_list[event_name][id_subscriber];
                }
            }

            if (Object.keys(this._subscribers_list[event_name]).length <= 0) {
                delete this._subscribers_list[event_name];
            }

        }
    }

    publish (event_name: string, data: unknown, local_flag: boolean = false): void {

        if (this._subscribers_list[event_name] === undefined) {
            return;
        }

        this._emit("publish", event_name, local_flag, data);
    }

    trigger (event_name: string, local_flag: boolean = false): void {

        if (this._subscribers_list[event_name] === undefined) {
            return;
        }

        this._emit("trigger", event_name, local_flag);
    }

    private _emit (type: "publish" | "trigger", event_name: string, local_flag: boolean = false, data: unknown = undefined): void {
        for (const id_subscriber in this._subscribers_list[event_name]) {
            const subscriber = this._subscribers_list[event_name][id_subscriber];
            if (subscriber.type !== "local" && local_flag === true) {
                continue;
            }
            subscriber.emit(type, data);
        }
    }

}