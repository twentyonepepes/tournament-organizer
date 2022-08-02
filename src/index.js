import delay from 'delay';
import { tournamentDaemon } from './daemon';
import { startServer } from './server';

startServer();

(async function(){

	while (true) {

		await tournamentDaemon();
		console.log("Completed iteration of tournament demon. Iterating again.");
		await delay(10000);
	}
	
})();
