import {create} from "zustand/react";
import {makeInitialNotenState} from "./state/initialNotenState.ts";
import {loadNotenState} from "../persistence/persistence.ts";
import type {RouteParams} from "./state/RouteParams.ts";




export const useNotenStore = create(() =>
    loadNotenState() ?? makeInitialNotenState())



export const setNotenStoreRouteParams = (routeParams: RouteParams) => useNotenStore.setState(state => ({...state, routeParams}));
/*
export const useStore = function() : State {
  return initialState;
}*/