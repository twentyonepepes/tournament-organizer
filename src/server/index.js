import docs from './docs.yml';

import { createServer } from '@twentyonepepes/server';
import { 
    tournament$, 
    fightStarting$, 
    matchupClusterStarting$, 
    fightResult$,
    matchupClusterResult$,
    tournamentResult$,
    tournamentStart$
} from '../streams';
import { firstValueFrom } from 'rxjs';
import { submitUserFightSubmission } from '../daemon';

export function startServer(){

    const { app } = createServer(7108, {
        streams : { 
            tournament$,
            tournamentStart$,
            tournamentResult$,
            fightStarting$,
            fightResult$,
            matchupClusterStarting$,
            matchupClusterResult$,
        },
        docs,
    });

    app.get('/tournament', async (_req,res)=>{

        const tournament = await firstValueFrom(tournament$);
        res.json(tournament);
        
    });

    app.post('/tournament/entrants/submit', async (req,res)=>{

        const { submission } = req.body;
        const result = submitUserFightSubmission(submission);
        res.json(result);
        
    });
}