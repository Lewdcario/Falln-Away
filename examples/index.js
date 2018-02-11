const options = require('../config-sample');
const { Client } = require('../src');

const client = new Client(options);
client.login();

const prefix = '!';
let queue = [];

client.on('ready', () => console.log('Logged in successfully!'));

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return null;
	const [command, ...args] = message.content.slice(prefix.length).split(' ');

	if (command === 'ping') return client.send(message.channel, 'pong!');
	if (command === 'queue') {
		if (queue.includes(message.author)) {
			return message.reply('Looks like you are already in the queue!');
		}
		queue.push(message.author);
		return client.send(message.channel, `I have successfully added you to the queue, ${message.author}!`);
	}
	if (command === 'viewqueue') {
		return client.send(message.channel, `Queue: ${queue.map(u => u.username).join(', ')}`);
	}
	if (command === 'next') {
		if (!message.author.mod && !message.author.broadcaster) {
			return client.send(message.channel, 'Only the broadcaster or a mod can use this command.');
		}
		if (!queue.length) return client.send(message.channel, 'There is nobody in the queue!');
		return client.send(message.channel, `${queue.shift()} is up next!`);
	}
	if (command === 'close' || command === 'finish') {
		if (!message.author.mod && !message.author.broadcaster) {
			return client.send(message.channel, 'Only the broadcaster or a mod can use this command.');
		}
		if (!queue.length) {
			return client.send(message.channel, 'The queue is already empty!');
		}
		if (isNaN(args[0])) {
			queue = [];
			return client.send(message.channel, 'The queue has been completely cleared! No more people!');
		}
		const amount = parseInt(args[0]) % queue.length;
		queue.slice(0, amount);
		return client.send(message.channel, `There is only time left for ${amount} more players, then the queue will be closed!`);
	}

	return null;
});

client.on('debug', (m) => console.log('[DEBUG]', m));

client.on('error', (m, e) => console.error('[ERROR]', m, e));
