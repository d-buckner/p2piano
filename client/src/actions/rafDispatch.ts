import { batch } from 'react-redux';

import type { AnyAction, Dispatch, PayloadAction } from '@reduxjs/toolkit';


export default function getRafDebounce(dispatch: Dispatch<AnyAction>) {
    let actionQueue: PayloadAction<any>[] = [];
    processActionQueue();

    return function rafDispatch(action: PayloadAction<any>) {
        actionQueue.push(action);
    }

    function processActionQueue() {
        requestAnimationFrame(processActionQueue);
        if (!actionQueue.length) {
            return;
        }
        batch(() => {
            actionQueue.forEach(dispatch);
        });
        actionQueue = [];
    }
}
