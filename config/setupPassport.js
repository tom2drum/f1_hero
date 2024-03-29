const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const mongoose = require('mongoose');

const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = require('./keys');

const setupPassport = () => {
	const User = mongoose.model('user');

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id).then(user => done(null, user));
	});

	passport.use(
		new TwitterStrategy(
			{
				consumerKey: TWITTER_CONSUMER_KEY,
				consumerSecret: TWITTER_CONSUMER_SECRET,
				callbackURL: '/auth/twitter/callback',
				proxy: true
			},
			//	handle the callback from Twitter OAUTH
			async (accessToken, refreshToken, profile, done) => {
				const user =
					(await User.findOne({
						twitterID: profile.id
					})) ||
					(await new User({
						twitterID: profile.id,
						username: profile.username
					}).save());

				done(null, user);
			}
		)
	);

	return [passport.initialize(), passport.session()];
};

module.exports = {
	setupPassport
};
