import type {Schuljahr} from "./Schuljahr.ts";
import type {RouteParams} from "./RouteParams.ts";

export interface NotenState {
  schuljahre: Schuljahr[],
  routeParams: RouteParams,
}

