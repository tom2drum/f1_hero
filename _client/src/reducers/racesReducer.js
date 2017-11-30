import { FETCH_RACES } from '../actions/types';

export default function(state = null, action) {
	switch (action.type) {
		case FETCH_RACES:
			return action.payload.data;
		default:
			return state;
	}
}
