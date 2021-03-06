import { IThreadsMessageBrokerSubscriber } from "../interfaces";

export class ThreadsMessageBrokerLocalSubscriber implements IThreadsMessageBrokerSubscriber {

    constructor (
        private readonly _id: string,
        private readonly _event: string,
        // eslint-disable-next-line @typescript-eslint/ban-types
        private readonly _fn: Function
    ) {}

    get id (): string {
        return this._id;
    }

    get event (): string {
        return this._event;
    }

    get worker (): string {
        return null;
    }

    get type (): "local" | "thread" {
        return "local";
    }

    emit (type: "trigger" | "publish", data: unknown): void {
        setImmediate(() => {
            if (type === "trigger") {
                this._fn();
            } else {
                this._fn(data);
            }
        });
    }

}