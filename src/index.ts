import fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import { join } from 'path';
import config = require('../config.json');
import { createHeader } from './authorisation';
import { convert } from './m3u8';

async function main() {
	let [, , id, path] = process.argv;

	if (!id) {
		console.log(`Download a twitter video\ndl-tweet <Tweet URL> [path]`);
		process.exit();
	}

	[, id] = id.match(/https:\/\/twitter.com\/.+\/status\/(\d+)/) || [];

	if (!id) {
		console.error('Invalid tweet url provided!');
		process.exit();
	}

	const url = `https://api.twitter.com/1.1/videos/tweet/config/${id}.json`;

	const res = await fetch(url, {
		method: 'get',
		headers: {
			authorization: createHeader(url)
		}
	})
		.then(res => res.json())
		.catch(() => null);

	if (!res) {
		console.log('I was unable to fetch this tweet.');
		process.exit();
	}

	const parts = await convert(res);

	path = path || join(config.defaultFilePath, res.track.contentId + '.mp4');

	writeFileSync(path, Buffer.concat(parts));

	console.log('Successfully downloaded the video to ' + path);
}

main();
