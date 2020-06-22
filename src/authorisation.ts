import config = require('../config.json');
import crypto from 'crypto';

const random = (n: number) => {
	const a = 'abcdefghijklmmopqrstuvwxyz0123456789'.split('');
	let s = '';
	while (n--) s += a[Math.floor(Math.random() * a.length)];
	return s;
};

export const createHeader = (url: string) => {
	const authorisation = {
		oauth_consumer_key: config.consumerKey,
		oauth_nonce: random(40),
		oauth_signature: null,
		oauth_signature_method: 'HMAC-SHA1',
		oauth_timestamp: Math.floor(new Date().getTime() / 1000),
		oauth_token: config.oauthToken,
		oauth_version: '1.0'
	};

	const parameterString = [
		'GET',
		encodeURIComponent(url),
		encodeURIComponent(
			Object.keys(authorisation)
				.filter(v => !!authorisation[v as keyof typeof authorisation])
				.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(authorisation[key as keyof typeof authorisation]!)}`)
				.join('&')
		)
	].join('&');

	const signingKey = encodeURIComponent(config.consumerSecret) + '&' + encodeURIComponent(config.oauthTokenSecret);

	// @ts-ignore
	authorisation.oauth_signature = crypto.createHmac('sha1', signingKey).update(parameterString).digest('base64');

	return `OAuth ${Object.keys(authorisation)
		.map(key => `${encodeURIComponent(key)}="${encodeURIComponent(authorisation[key as keyof typeof authorisation]!)}"`)
		.join(', ')}`;
};
