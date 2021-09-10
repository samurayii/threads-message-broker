import { IThreadsMessageBrokerMessage, IThreadsMessageBrokerSubscriber } from "../interfaces";
import { Worker } from "worker_threads";

export class ThreadsMessageBrokerThreadSubscriber implements IThreadsMessageBrokerSubscriber {

    constructor (
        private readonly _id: string,
        private readonly _event: string,
        private readonly _worker_name: string,
        private readonly _worker: Worker
    ) {}

    get id (): string {
        return this._id;
    }

    get event (): string {
        return this._event;
    }

    get worker (): string {
        return this._worker_name;
    }

    get type (): "local" | "thread" {
        return "thread";
    }

    emit (type: "trigger" | "publish", data: unknown): void {

        const message: IThreadsMessageBrokerMessage = {
            command: type,
            worker: null,
            event: this._event,
            id_subscriber: this._id
        };

        if (type === "publish") {
            message.data = data;
        }

        this._worker.postMessage(JSON.stringify(message));
    }

}