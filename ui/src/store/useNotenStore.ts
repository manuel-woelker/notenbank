import {type RouteParams} from "./NotenState.ts";
import {create} from "zustand/react";
import {makeInitialNotenState} from "./initialNotenState.ts";


export const useNotenStore = create(makeInitialNotenState)



export const setNotenStoreRouteParams = (routeParams: RouteParams) => useNotenStore.setState(state => ({...state, routeParams}));
/*
export const useStore = function() : State {
  return initialState;
}*/