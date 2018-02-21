/* eslint-disable complexity */

const options = require('./config-sample');
const { Client } = require('../src');

const client = new Client(options);
client.login();

const prefix = '!';
let queue = [];
let enabled = true;
let amt = 0;

client.on('ready', () => console.log('Logged in successfully!'));

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return null;
	const [command, ...args] = message.content.slice(prefix.length).split(' ');

	if (command === 'ping') return client.send(message.channel, 'pong!');
	if (!enabled && amt === 0) {
		return client.send(message.channel, 'Commands are currently disabled!');
	}
	if (command === 'queue' || command === 'join') {
		if (queue.includes(message.author)) return client.send('You are already in the queue!');
		if (!enabled) --amt;
		queue.push(message.author);
		return client.send(message.channel, `I have successfully added you to the queue, ${message.author}!`);
	}
	if (command === 'viewqueue' || command === 'showqueue') {
		return client.send(message.channel, `Queue: ${queue.map(u => u.username).join(', ')}`);
	}
	if (command === 'next') {
		if (!message.author.mod && !message.author.broadcaster) {
			return client.send(message.channel, 'Only the broadcaster or a mod can use this command.');
		}
		if (queue.length === 0) return client.send(message.channel, 'There is nobody in the queue!');
		return client.send(message.channel, `${queue.shift()}, you're up!`);
	}
	if (command === 'close' || command === 'finish') {
		if (!message.author.broadcaster) {
			return client.send(message.channel, 'Only the broadcaster can use this command.');
		}
		enabled = false;
		if (!queue.length) {
			return client.send(message.channel, 'The queue is already empty, commands have been disabled!');
		}
		if (isNaN(args[0])) {
			queue = [];
			return client.send(message.channel, 'The queue has been completely cleared! No more people!');
		}
		amt = parseInt(args[0]);
		return client.send(message.channel, `There is only time left for ${amt} more players, then the queue will be closed!`);
	}
	if (command === 'enable') {
		if (!message.author.broadcaster) {
			return client.send(message.channel, 'Only the broadcaster can use this command.');
		}
		enabled = true;
		amt = 0;
		return client.send(message.channel, 'Commands have been re-enabled!');
	}

	return null;
});

client.on('debug', (m) => console.log('[DEBUG]', m));

client.on('error', (m, e) => console.error('[ERROR]', m, e));
