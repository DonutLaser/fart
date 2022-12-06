interface Subscription {
    id: number;
    callback: Function;
};

export enum Event {
    SELECT_CONNECTED = 'select-connected',
    CLEAR_CONNECTIONS = 'clear-connections',
    SAVE = 'save',
    LOAD = 'load',
};

let nextId = 0;
const bus: { [name: string]: Subscription[] } = {};


export function emit(name: string, data?: any) {
    const event = bus[name];
    if (!event) { return; }

    for (const sub of event) { sub.callback(data); }
}

export function subscribe(name: string, callback: Function): Function {
    const event = bus[name];
    const id = nextId++;

    if (!event) { bus[name] = []; }
    bus[name].push({ id, callback });

    return () => { unsubscribe(name, id); }
}

function unsubscribe(name: string, id: number) {
    const event = bus[name];
    if (!event) { return; }

    const index = event.findIndex(sub => sub.id === id);
    if (index === -1) { return; }

    bus[name] = [...event.splice(index, 1)];
}