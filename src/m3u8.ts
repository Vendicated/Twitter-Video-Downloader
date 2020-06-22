import fetch from 'node-fetch';

export const convert = async (res: Record<string, any>) => {
	const m3u8 = await fetch(res.track?.playbackUrl)
		.then(res => res.text())
		.catch(() => null);

	if (!m3u8) {
		console.error('This tweet does not appear to have any media.');
		process.exit();
	}

	const resolutions = m3u8
		.match(/#EXT-X.+\n.*m3u8/g)
		?.map(res => ({ resolution: res.match(/RESOLUTION=(\d+)/)?.[1], url: res.match(/\n(.+)/)?.[1] }))
		?.filter(res => !!res && !!res.resolution && !!res.url) as Record<'resolution' | 'url', string>[];

	if (!resolutions || !resolutions.length) {
		console.error(`No video sources found!`);
		process.exit();
	}

	const highest = resolutions.sort((x, y) => parseInt(x.resolution) - parseInt(y.resolution))[resolutions.length - 1];

	console.log(`Downloading video with the resolution ${highest.resolution}px`);
	const url = 'https://video.twimg.com' + highest.url;

	const tsUrls = (await fetch(url).then(res => res.text())).match(/ext_tw_video.+ts/g)?.map(url => 'https://video.twimg.com/' + url);

	if (!tsUrls) {
		console.error(`No video links found!`);
		process.exit();
	}

	return await Promise.all(tsUrls.map(url => fetch(url).then(res => res.buffer())));
};
