//   Import the Libraries from React and tmdbAPI
import React from 'react';
import tmdbAPI from '../tmdbAPI';

// Import the Components
import SearchBox from './SearchBox';
import SearchResults from './SearchResults';
import WatchList from './WatchList';
import LoginForm from './LoginForm';

// The componentWillMount() is a chance for us to handle configuration, update our state, and in general prepare for the first render.

const App = React.createClass({
	componentWillMount() {
		window.addEventListener('resize', this.handleWindowResize);
		this.handleWindowResize();
// Create a new session id  with the athorized request token

// By calling the new session method with the request token that has been approved by the user in step 2, we will return a new session_id.
		if(tmdbAPI.sessionId) {
			this.skipLogin();
		}
	},

	handleWindowResize(event) {
		this.setState({
			windowWidth: window.innerWidth
		});
	},

	render() {
		var resultsActions = this.props.flux.getActions('results');

		var watchlist = this.props.watchlist ? this.props.watchlist.map(movie => _.extend(movie, {
			poster_url: 'http://image.tmdb.org/t/p/w300' + movie.poster_path
		})) : null;

		var wrapperStyle = {
			// Reset
			fontSize: '1rem',
			// Color
			backgroundColor: '#272727',
			color: '#efefef',
			paddingBottom: 250
		};

		var headerStyles = {
			position: 'fixed',
			bottom: 0,
			left: 0,
			zIndex: 1,
			width: '100%',
			background: '-webkit-linear-gradient(bottom, rgba(0,0,0,1) 0%,rgba(0,0,0,1) 50%,rgba(0,0,0,0) 100%)',
			color: '#fff',
			padding: '4rem 2rem 2rem',
			pointerEvents: 'none'
		};

		var headerTitleStyles = {
			fontSize: '2rem'
		};

		var headerBodyStyles = {
			overflow: 'hidden'
		};

		var headerDescStyles = {
			paddingTop: '1em',
			lineHeight: 1.4,
			float: 'left',
			fontSize: '1.2rem'
		};

		var headerLogoutBtnStyles = {
			float: 'right',
			paddingTop: '1em',
			color: '#42aaf3',
			borderBottom: '1px solid',
			fontSize: '1.2rem',
			pointerEvents: 'auto'
		};

		return (
			<section style={wrapperStyle}>

				<header style={headerStyles}>
					<h1 style={headerTitleStyles}>Watchlist.</h1>
					<div style={headerBodyStyles}>
						<p style={headerDescStyles}>Built by Sneha Spandana.</p>
						{(this.props.authorized &&
							<button style={headerLogoutBtnStyles} onClick={this.handleLogOutBtnClick}>Log out</button>
						)}
					</div>
				</header>

				{this.props.authorized && <SearchBox
					value={this.props.query}
					onSearch={resultsActions.movieQuery}
					onClear={resultsActions.clearSearch}
					windowWidth={this.state.windowWidth}
				/>}

				{this.props.authorized && (
					<div>

						<SearchResults
							results={this.props.results}
							watchlist={watchlist}
							user={this.props.user}
							onItemClick={this.onSearchResultsItemClick}
							windowWidth={this.state.windowWidth}
						/>

						<WatchList
							watchlist={watchlist}
							onItemDeleteBtnClick={this.onWatchListItemDelete}
							style={{paddingTop: 50}}
							windowWidth={this.state.windowWidth}
						/>

					</div>
				) || (

					<LoginForm onSubmit={this.handleLoginFormSubmit} style={{
						marginTop: '5rem'
					}} />

				)}

			</section>
		);
	},

	onSearchResultsItemClick(movie) {
		this.props.flux.getActions('watchlist').watchlistAdd(movie, this.props.user);
	},

	onWatchListItemDelete(movie) {
		this.props.flux.getActions('watchlist').watchlistRemove(movie, this.props.user);
	},

	async handleLoginFormSubmit(formData) {
		await this.props.flux.getActions('user').userLogin(formData);
		this.fetchData();
	},

	async skipLogin(formData) {
		await this.props.flux.getActions('user').userSkipLogin();
		this.fetchData();
	},

	async fetchData() {
		var user = await this.props.flux.getActions('user').userFetch();
	 	await this.props.flux.getActions('watchlist').watchlistFetch(user);
	},

	handleLogOutBtnClick(event) {
		this.props.flux.getActions('user').userLogout();
	}
});

export default App;
