export const state = [];
const undoHistory = [];

export let index = -1;

export const setState = function (newState) {
  state.push(newState);
  index = state.length - 1;
};

export const undo = function () {
  // debugger;
  if (state.length == 1) {
    return state[0];
  } else {
    const toUndoState = state.pop();
    undoHistory.push(toUndoState);
    console.log(undoHistory);
    return toUndoState;
  }
};
