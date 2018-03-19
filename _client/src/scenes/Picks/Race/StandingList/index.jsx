/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { arrayMove } from 'react-sortable-hoc';

import ForecastNew from './ForecastNew';
import ForecastMissed from './ForecastMissed';
import ForecastSubmitted from './ForecastSubmitted';
import { getNodePaddings } from '../../../../services/utils/functions';
import { postPick } from './api';
import { racePropType } from '../index';
import './styles.scss';

class StandingList extends Component {
	state = {
		pickPos: 0,
		stemPos: 0,
		list:
			this.props.status === 'submitted' ? this.props.list : this.props.drivers,
		status: this.props.status
	};

	componentDidMount() {
		const { pickPos, stemPos } = this.computePickPosition();
		const newState = {
			...this.state,
			pickPos,
			stemPos
		};
		this.setState(newState);
	}

	onSortEnd = ({ oldIndex, newIndex }) => {
		const newList = arrayMove(this.state.list, oldIndex, newIndex);
		const formattedList = newList.map((value, index) => ({
			...value,
			position: index + 1
		}));

		const newState = {
			...this.state,
			list: formattedList //	todo make list array immutable
		};
		this.setState(newState);
	};

	computePickPosition() {
		const { races, round } = this.props;
		const racesNum = races.length;

		const picksNode = document.getElementById('picks');
		const stemNode = document.getElementById('stem');
		const raceNode = document.getElementById('race');
		const raceHolderNode = document.getElementById('race-holder');

		const picksWidth = picksNode ? picksNode.offsetWidth : 0;
		const stemWidth = stemNode ? stemNode.offsetWidth : 0;
		const raceWidth = raceNode.offsetWidth;
		const holderWidth = raceHolderNode.offsetWidth;
		const holderPadding = getNodePaddings(raceHolderNode);

		const gutter =
			(holderWidth - holderPadding - raceWidth * racesNum) / (racesNum - 1);

		const offset =
			holderPadding / 2 +
			raceWidth * round -
			raceWidth / 2 +
			gutter * (round - 1) -
			picksWidth / 2;

		if (offset < 0) {
			return {
				pickPos: 0,
				stemPos:
					holderPadding / 2 +
					raceWidth / 2 +
					(raceWidth + gutter) * (round - 1) -
					stemWidth / 2 * 1.41
			};
		} else if (offset + picksWidth > holderWidth) {
			return {
				pickPos: holderWidth - picksWidth,
				stemPos:
					picksWidth -
					stemWidth / 2 * 1.41 -
					raceWidth / 2 -
					holderPadding / 2 -
					(raceWidth + gutter) * (racesNum - round)
			};
		}
		return {
			pickPos: offset,
			stemPos: picksWidth / 2 - stemWidth / 2
		};
	}

	submitPick = async () => {
		const { round, onSubmit, updateRace } = this.props;
		try {
			const { pick } = (await postPick(round, {
				round,
				forecast: this.state.list.slice(0, 10)
			})).data;

			const newState = {
				...this.state,
				status: 'submitted',
				list: pick.forecast
			};

			this.setState(newState);
			onSubmit(pick);
			updateRace({ round, field: 'hasPick', value: true });
		} catch (error) {
			//	todo display an error as a flash message
			console.error('error: unable to save pick!!', error);
		}
	};

	displayButton() {
		return this.state.status === 'new' ? (
			<div
				className="btn btn-submit"
				onClick={this.submitPick}
				role="button"
				tabIndex="0"
			>
				<i className="fa fa-check" aria-hidden="true" /> Submit
			</div>
		) : null;
	}

	render() {
		let Standings;

		switch (this.state.status) {
			case 'new':
				Standings = ForecastNew;
				break;
			case 'passed':
				Standings = ForecastMissed;
				break;
			default:
				Standings = ForecastSubmitted;
		}

		return (
			<div
				id="picks"
				className="StandingList"
				style={{ left: `${this.state.pickPos}px` }}
			>
				<div
					id="stem"
					className="stem"
					style={{ left: `${this.state.stemPos}px` }}
				/>
				<Standings
					items={this.state.list}
					onSortEnd={this.onSortEnd}
					lockToContainerEdges
					helperClass="draggable"
					lockAxis="y"
				/>
				{this.displayButton()}
			</div>
		);
	}
}

export const listItemPropTypes = {
	position: PropTypes.number.isRequired,
	_drivers: PropTypes.arrayOf(
		PropTypes.shape({
			code: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired
		})
	)
};

StandingList.defaultProps = {
	list: [],
	drivers: [],
	onSubmit: () => {}
};

StandingList.propTypes = {
	status: PropTypes.string.isRequired,
	list: PropTypes.arrayOf(PropTypes.shape(listItemPropTypes)),
	drivers: PropTypes.arrayOf(PropTypes.shape(listItemPropTypes)),
	round: PropTypes.number.isRequired,
	races: PropTypes.arrayOf(PropTypes.shape(racePropType)).isRequired,
	onSubmit: PropTypes.func,
	updateRace: PropTypes.func.isRequired
};

export default StandingList;
