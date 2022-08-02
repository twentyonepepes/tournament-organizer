import delay from 'delay';
import { v4 } from 'uuid';

import {
	createTournament,
	addMonster,
	getMatchupClusterWinner,
	getNextMatchupCluster,
	reportMatchupResult,
	reportMatchupClusterResult,
	advanceRound
} from '../../../tournament-model/bin';

import {
	getFightResult,
	getFightProgress,
	signalFightStart
} from "../network";
import {
	randomMonster
} from '../../../../monster-annex/monster-generator/bin';

import { fightResult$, fightStarting$, matchupClusterResult$, matchupClusterStarting$, tournament$, tournamentComplete$, tournamentResult$ } from '../streams';

async function waitForEmulatorIdle(){

	while (await getFightProgress()) {
		await delay(1000);
	}
}

let userFightSubmissions = [{
	username : "SMOKEBOWLINGTON",
	MONSTER_NAME : "AEON",
	RACE_TYPE : "DRAGON"
}];

export function submitUserFightSubmission(submission){
	const { username } = submission;

	const submissionExistsError  = userFightSubmissions.find(n => n.username === username);

	if (submissionExistsError) {
		return {
			success : false,
			errors : {
				submissionExistsError
			}
		}
	};

	userFightSubmissions.push(submission);
	return {
		success : true,
		errors: {}
	}

}

function submissionToMonster(submission, team) {

	const { RACE_TYPE, MONSTER_NAME } = submission ? submission : {};	

	const TRAINER_NAME = team;
	
	const monster = {
		...randomMonster({
			RACE_TYPE_OPTION : RACE_TYPE
		}),
		TRAINER_NAME,
	};

	if (MONSTER_NAME) {
		monster.MONSTER_NAME = MONSTER_NAME;
	}

	return monster;

}

export async function tournamentDaemon() {

	const nextTournamentId = `t-${v4()}`;

	let tournament = createTournament({_id : nextTournamentId });

	tournament$.next(tournament);

	for (const team of tournament.teams) {
		
		for (let i = 0; i < 5; i++) {

			const submission = userFightSubmissions.length > 0 ? userFightSubmissions.shift() : null;
			const monster = submissionToMonster(submission, team);
			tournament = addMonster(tournament, team, { _id: `${team}-${i + 1}`, ...monster });
			
		}
	}
	
	tournament$.next(tournament);

	const { monsters } = tournament;

	for (let clusterSize of [4, 2, 1, 1]) {

		for (let i = 0; i < clusterSize; i++) {

			let matchupCluster = getNextMatchupCluster(tournament);
			matchupClusterStarting$.next(matchupCluster);

			const { matchups } = matchupCluster;

			for (const matchup of matchups) {

				await waitForEmulatorIdle();

				const { left, right } = matchup;

				await signalFightStart([monsters[left],monsters[right]]);

				fightStarting$.next(matchup);

				await waitForEmulatorIdle();

				const { leftSideWins } = await getFightResult();
				const winner = leftSideWins ? left : right;

				fightResult$.next({
					winner,
					matchup
				});

				matchupCluster = reportMatchupResult(matchupCluster, matchup._id, winner);
			}
			
			const winner = getMatchupClusterWinner(matchupCluster);
			tournament = reportMatchupClusterResult(tournament, matchupCluster, winner);
			tournament$.next(tournament);
			matchupClusterResult$.next({
				matchupCluster,
				winner
			})

		}

		tournament = advanceRound(tournament);
		tournament$.next(tournament);

	}

	tournamentResult$.next(tournament);

}