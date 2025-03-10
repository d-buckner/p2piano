import axios from 'axios';
import ConfigProvider from '../lib/ConfigProvider';
import Session from '../lib/Session';

import type { Room } from '../lib/workspaceTypes';

function url(paths: string[]): string {
    return [ConfigProvider.getServiceUrl(), ...paths].join('/');
}

export function createNewRoom() {
    return post<Room>('room');
}

export function createSession() {
    return post<Session>('session');
}

export function getRoom(roomId: string) {
    return get<Room>('room', roomId);
}

async function post<T>(...paths: string[]) {
    const response = await axios.post<T>(url(paths));
    return response.data;
}

async function get<T>(...paths: string[]): Promise<T> {
    const rawResponse = await fetch(url(paths));
    const response = await rawResponse.json();
    const { statusCode } = response;
    const codeFamily = Math.floor(statusCode / 100) * 100;
    if (codeFamily === 400 || codeFamily === 500) {
        throw new Error(response.message);
    }

    return response;
}
