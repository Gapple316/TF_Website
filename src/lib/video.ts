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

export function getCardEmbedUrl(
	url?: string,
	startSeconds?: number,
): string | undefined {
	const info = parseVideoUrl(url);
	if (!info) return undefined;

	if (info.provider === "youtube") {
		const base = `https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1`;
		return startSeconds ? `${base}&start=${startSeconds}` : base;
	}
	const base = `https://player.vimeo.com/video/${info.id}?autoplay=1`;
	return startSeconds ? `${base}#t=${startSeconds}s` : base;
}

/**
 * Vorschaubild eines Beitrags: ein explizit gepflegtes thumbnail schlägt das
 * automatisch geholte Plattform-Thumbnail. Nötig für Beiträge, die weder auf
 * YouTube noch auf Vimeo liegen (z.B. RTS-Mediathek) – dort gibt es nichts
 * automatisch zu holen.
 */
export async function getPosterUrl(data: {
	thumbnail?: string;
	videoUrl?: string;
}): Promise<string | undefined> {
	return data.thumbnail ?? (await getThumbnailUrl(data.videoUrl));
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
