import ConfigProvider from '../lib/ConfigProvider';
import type { Room } from '../lib/workspaceTypes';


function url(paths: string[]): string {
    return [ConfigProvider.getServiceUrl(), ...paths].join('/');
}

export function createNewRoom() {
    return post<Room>('room');
}

export function getRoom(roomId: string) {
    return get<Room>('room', roomId);
}

async function post<T>(...paths: string[]): Promise<T> {
    const response = await fetch(url(paths), {
        method: 'POST',
        credentials: 'include', // Include cookies
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

async function get<T>(...paths: string[]): Promise<T> {
    const response = await fetch(url(paths), {
        credentials: 'include', // Include cookies
    });
    
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
        const { statusCode, message } = data;
        throw new Error(message || `HTTP ${statusCode || response.status}: ${response.statusText}`);
    }

    return data;
}
