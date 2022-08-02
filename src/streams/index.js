import { BehaviorSubject, Subject } from "rxjs";

export const tournament$ = new BehaviorSubject({});
export const tournamentStart$ = new Subject();
export const tournamentResult$ = new Subject();
export const fightStarting$ = new Subject();
export const fightResult$ = new Subject();
export const matchupClusterStarting$ = new Subject();
export const matchupClusterResult$ = new Subject();
export const matchupResult$ = new Subject();