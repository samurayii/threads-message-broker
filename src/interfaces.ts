import { Worker } from "worker_threads";

export interface IThreadsMessageBroker {
    addThread: (worker_name: string, worker: Worker) => void
    publish: (event_name: string, data: unknown, local_flag: boolean) => void
    // eslint-disable-next-line @typescript-eslint/ban-types
    subscribe: (event_name: string, fn: Function) => string
    unsubscribe: (id_subscriber: string) => void
}

export interface IThreadsMessageBrokerSubscriber {
    readonly id: string
    readonly event: string
    readonly worker: string
    readonly type: "local" | "thread"
    emit: (data: unknown) => void
}

export interface IThreadsMessageBrokerMessage {
    command: "publish" | "subscribe" | "unsubscribe" | "ready"
    worker: string | null
    event?: string
    id_subscriber?: string
    data?: unknown
}