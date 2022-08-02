import { get, post } from "axios";
import delay from "delay";

const EMULATOR_MANAGER_URL = `http://127.0.0.1:7771`;

export const retryWrapAsyncCall = (call) => async (args) => {

	while (true) {

		try {

			return await call(args);


		} catch (e) {

			console.warn("Failure caught by async communication wrapper", e.message);
			console.warn("Retrying in 10s");
			await delay(10000);

		}

	}
}

export async function signalFightStart(definitions) {

	const call = async () => {
		await post(`${EMULATOR_MANAGER_URL}/control/start`, definitions)
		console.info("Sent definitions to emulator", definitions);
	};

	return await retryWrapAsyncCall(call)(definitions);

}

export async function getFightProgress() {

	const call = async () => {

		const { data : x }  = await get(`${EMULATOR_MANAGER_URL}/status/getFightProgress`);
		const { inProgress } =x;
		return inProgress;

	}

	return await retryWrapAsyncCall(call)();

}

export async function getFightResult() {

	try {

		const { data : x } = await get(`${EMULATOR_MANAGER_URL}/status/outcome`);
		const { leftSideWins } = x;
		return { leftSideWins };

	} catch (e) {

		console.log("Fight res error, return default val");

		return { 
			leftSideWins : true
		}
	}
}
