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

    emit (data: unknown): void {
        setImmediate(() => {
            this._fn(data);
        });

    }

}