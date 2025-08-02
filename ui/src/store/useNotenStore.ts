import {type RouteParams} from "./NotenState.ts";
import {create} from "zustand/react";
import {makeInitialNotenState} from "./initialNotenState.ts";
import {loadNotenState} from "../persistence/persistence.ts";




export const useNotenStore = create(() =>
    loadNotenState() ?? makeInitialNotenState())



export const setNotenStoreRouteParams = (routeParams: RouteParams) => useNotenStore.setState(state => ({...state, routeParams}));
/*
export const useStore = function() : State {
  return initialState;
}*/