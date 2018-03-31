const EventEmitter = require('events');

// TODO: document this and options
class Collector extends EventEmitter {
	constructor(client, options = {}) {
		super();

		/**
		 * The client that initiated this collector
		 * @type {Client}
		 */
		this.client = client;

		/**
		 * The options to be applied to this collector
		 * @type {Object}
		 */
		this.options = options;

		/**
		 * The items collected by this collector
		 * @type {Map}
		 */
		this.collected = new Map();

		/**
		 * The amount of items collected by this collector
		 * @type {number}
		 */
		this.responses = 0;

		/**
		 * The channel for this collector
		 * @type {string}
		 */
		this.channel = options.channel;

		this.client.on('message', this.onCollect.bind(this));
		this.once('end', () => this.client.removeListener('message', this.onCollect));
	}

	/**
	 * Called to handle the collection of a message
	 * @param {Message} message The message to collect
	 * @emits Collector#collect
	 */
	onCollect(message) {
		if (this.channel && message.channel !== this.channel) return;
		if (!this.options.filter(message)) return;

		this.collected.set(++this.responses, message);
		this.emit('collect', message);

		if (this.options.once === true) this.emit('end', this.collected);
		else if (this.options.max === this.responses) this.emit('end', this.collected);
	}
}

module.exports = Collector;
