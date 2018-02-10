const User = require('./User');

/**
 * Represents a message on Twitch 
 */
class Message {
	constructor(data) {
		/**
		 * The content of the message
		 * @type {string}
		 */
		this.content = data.match(/:\s*([^:]+)$/)[1].replace(/ {2}|\r\n|\n|\r/gm, '');

		/**
		 * The author of the message
		 * @type {User}
		 */
		this.author = new User(data);

		/**
		 * The channel the message was sent in
		 * @type {string}
		 */
		this.channel = `#${/[\s\S]*#(.*) /.test(data) ? data.match(/[\s\S]*#(.*) /)[1] : null}`;
	}

	/**
	 * When concatenated with a string, this automatically concatenates the message's content instead of the object.
	 * @returns {string}
	 * @example
	 * console.log(`Message: ${message}`);
	*/
	toString() {
		return this.content;
	}
}

module.exports = Message;
