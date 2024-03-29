import { IThreadsMessageBroker, IThreadsMessageBrokerMessage, IThreadsMessageBrokerSubscriber } from "../interfaces";
import * as worker_threads from "worker_threads";
import { v4 as uuid } from "uuid";
import { ThreadsMessageBrokerLocalSubscriber } from "./threads-message-broker-local-subscriber";

export class ThreadsMessageBrokerSlave implements IThreadsMessageBroker {

    private readonly _subscribers_list: {
        [key: string]: {
            [key: string]: IThreadsMessageBrokerSubscriber
        }
    }

    constructor () {

        if (worker_threads.isMainThread === true) {
            throw new Error("Thread is main");
        }

        this._subscribers_list = {};

        worker_threads.parentPort.on("message", (data: string) => {
            
            const message: IThreadsMessageBrokerMessage = JSON.parse(data);

            if (message.command === "publish") {

                if (this._subscribers_list[message.event] === undefined) {
                    return;
                }
        
                for (const id_subscriber in this._subscribers_list[message.event]) {
                    const subscriber = this._subscribers_list[message.event][id_subscriber];
                    subscriber.emit("publish", message.data);
                }

            }

            if (message.command === "trigger") {

                if (this._subscribers_list[message.event] === undefined) {
                    return;
                }
        
                for (const id_subscriber in this._subscribers_list[message.event]) {
                    const subscriber = this._subscribers_list[message.event][id_subscriber];
                    subscriber.emit("trigger");
                }

            }
            
        });

    }

    publish (event_name: string, data: unknown, local_flag: boolean = false): void {
        this._emit("publish", event_name, local_flag, data);
    }

    trigger (event_name: string, local_flag: boolean = false): void {
        this._emit("trigger", event_name, local_flag);
    }

    private _emit (type: "publish" | "trigger", event_name: string, local_flag: boolean = false, data: unknown = undefined): void {

        if (this._subscribers_list[event_name] !== undefined) {
            for (const id_subscriber in this._subscribers_list[event_name]) {
                const subscriber = this._subscribers_list[event_name][id_subscriber];
                subscriber.emit(type, data);
            }
        }
        
        if (local_flag === true) {
            return;
        }

        const message: IThreadsMessageBrokerMessage = {
            command: type,
            event: event_name,
            worker: null
        };

        if (type === "publish") {
            message.data = data;
        }

        worker_threads.parentPort.postMessage(JSON.stringify(message));

    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    subscribe (event_name: string, fn: Function): string {

        if (this._subscribers_list[event_name] === undefined) {
            this._subscribers_list[event_name] = {};
        }

        const id = uuid();
        const subscriber = new ThreadsMessageBrokerLocalSubscriber(id, event_name, fn);

        this._subscribers_list[event_name][id] = subscriber;

        const parent_message: IThreadsMessageBrokerMessage = {
            command: "subscribe",
            id_subscriber: id,
            event: event_name,
            worker: null
        };

        worker_threads.parentPort.postMessage(JSON.stringify(parent_message));

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

        const parent_message: IThreadsMessageBrokerMessage = {
            command: "unsubscribe",
            id_subscriber: id,
            event: event_name,
            worker: null
        };

        worker_threads.parentPort.postMessage(JSON.stringify(parent_message));

    }

    addThread (): void {
        throw new Error("Thread is not main");
    }

    removeThread (): void {
        throw new Error("Thread is not main");
    }
   
}