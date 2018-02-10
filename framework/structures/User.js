/**
 * Represents a user on Twitch
 */
class User {
	constructor(data) {
		/**
		 * The ID of the user
		 * @type {number}
		 */
		this.id = parseInt(data.match(/user-id=(.\d*)/)[1]);

		/**
		 * The username of the user
		 * @type {string}
		 */
		this.username = data.match(/PRIVMSG #(.*) :/)[1];

		/**
		 * The user's selected display name
		 * @type {string}
		 */
		this.displayName = data.match(/display-name=(.*);/)[1];

		/**
		 * Whether or not the user is a bot
		 * @type {boolean}
		 */
		this.bot = this.username.includes('bot') || this.username.includes('Bot');

		/**
		 * Whether or not the user is the channel's broadcaster
		 * @type {boolean}
		 */
		this.broadcaster = /[\s\S]*#(.*) /.test(data) ? data.match(/[\s\S]*#(.*) /)[1] === this.username : false;

		/**
		 * Whether or not the user is a mod for the channel
		 * @type {boolean}
		 */
		this.mod = Boolean(parseInt(data.match(/mod=(\d)/)[1]));

		/**
		 * Whether or not the user is subcribed to the channel
		 * @type {boolean}
		 */
		this.subscriber = Boolean(parseInt(data.match(/subscriber=(\d)/)[1]));

		/**
		 * Whether or not the user is subcribed to Twitch
		 * @type {boolean}
		 */
		this.turbo = Boolean(parseInt(data.match(/turbo=(\d)/)[1]));

		/**
		 * The user's selected color
		 * @type {string}
		 */
		this.color = (data.match(/#([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?\b/) || [])[0];
	}
	/**
	 * When concatenated with a string, this automatically concatenates the user's mention instead of the User object.
	 * @returns {string}
	 * @example
	 * console.log(`Hello from ${user}!`);
	 */
	toString() {
		return `@${this.username}`;
	}
}

module.exports = User;
