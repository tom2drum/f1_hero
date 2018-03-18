import React from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({ searchTerm, onChange }) => (
	<div className="search-bar">
		<input
			type="text"
			placeholder="Search..."
			onChange={onChange}
			value={searchTerm}
		/>
		<i className="fa fa-search" aria-hidden="true" />
	</div>
);

SearchBar.propTypes = {
	searchTerm: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired
};

export default SearchBar;
