export type VideoProvider = "youtube" | "vimeo";

export interface VideoInfo {
	provider: VideoProvider;
	id: string;
}

export function parseVideoUrl(url?: string): VideoInfo | undefined {
	if (!url) return undefined;

	const youtube = url.match(
		/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{6,})/,
	);
	if (youtube) return { provider: "youtube", id: youtube[1] };

	const vimeo = url.match(/vimeo\.com\/(\d+)/);
	if (vimeo) return { provider: "vimeo", id: vimeo[1] };

	return undefined;
}

export function getBackgroundEmbedUrl(
	url?: string,
	startSeconds?: number,
): string | undefined {
	const info = parseVideoUrl(url);
	if (!info) return undefined;

	if (info.provider === "youtube") {
		// disablekb/fs/iv_load_policy/playsinline: this embed is a pure
		// background visual (pointer-events: none in markup) — these params
		// ensure no operable-looking control ever renders, even briefly or
		// on platforms (e.g. iOS Safari without playsinline) that would
		// otherwise show native player chrome.
		const base = `https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1&mute=1&loop=1&playlist=${info.id}&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1`;
		return startSeconds ? `${base}&start=${startSeconds}` : base;
	}

	const base = `https://player.vimeo.com/video/${info.id}?background=1&autoplay=1&loop=1&muted=1`;
	return startSeconds ? `${base}#t=${startSeconds}s` : base;
}

export function getCardEmbedUrl(url?: string): string | undefined {
	const info = parseVideoUrl(url);
	if (!info) return undefined;

	if (info.provider === "youtube") {
		return `https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1`;
	}
	return `https://player.vimeo.com/video/${info.id}?autoplay=1`;
}

export async function getThumbnailUrl(url?: string): Promise<string | undefined> {
	const info = parseVideoUrl(url);
	if (!info) return undefined;

	if (info.provider === "youtube") {
		return `https://i.ytimg.com/vi/${info.id}/hqdefault.jpg`;
	}

	try {
		const res = await fetch(
			`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${info.id}`)}`,
		);
		if (!res.ok) return undefined;
		const data = (await res.json()) as { thumbnail_url?: unknown };
		return typeof data.thumbnail_url === "string" ? data.thumbnail_url : undefined;
	} catch {
		return undefined;
	}
}
