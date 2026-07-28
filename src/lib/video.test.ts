import { describe, it, expect, vi, afterEach } from "vitest";
import {
	parseVideoUrl,
	getBackgroundEmbedUrl,
	getCardEmbedUrl,
	getThumbnailUrl,
} from "./video";

describe("parseVideoUrl", () => {
	it("parses a youtu.be short link", () => {
		expect(parseVideoUrl("https://youtu.be/w0_fK4r7Yrs")).toEqual({
			provider: "youtube",
			id: "w0_fK4r7Yrs",
		});
	});

	it("parses a youtube.com watch link", () => {
		expect(
			parseVideoUrl("https://www.youtube.com/watch?v=upDnMP7eHAc"),
		).toEqual({ provider: "youtube", id: "upDnMP7eHAc" });
	});

	it("parses a vimeo link", () => {
		expect(parseVideoUrl("https://vimeo.com/1152950764")).toEqual({
			provider: "vimeo",
			id: "1152950764",
		});
	});

	it("returns undefined for an unrecognized or missing url", () => {
		expect(parseVideoUrl("https://example.com/video")).toBeUndefined();
		expect(parseVideoUrl(undefined)).toBeUndefined();
	});
});

describe("getBackgroundEmbedUrl", () => {
	it("builds a muted autoplay loop embed for youtube", () => {
		expect(getBackgroundEmbedUrl("https://youtu.be/w0_fK4r7Yrs")).toBe(
			"https://www.youtube-nocookie.com/embed/w0_fK4r7Yrs?autoplay=1&mute=1&loop=1&playlist=w0_fK4r7Yrs&controls=0&modestbranding=1&rel=0&showinfo=0",
		);
	});

	it("builds a background embed for vimeo", () => {
		expect(getBackgroundEmbedUrl("https://vimeo.com/1152950764")).toBe(
			"https://player.vimeo.com/video/1152950764?background=1&autoplay=1&loop=1&muted=1",
		);
	});

	it("returns undefined without a url", () => {
		expect(getBackgroundEmbedUrl(undefined)).toBeUndefined();
	});
});

describe("getCardEmbedUrl", () => {
	it("builds a click-to-play embed for youtube", () => {
		expect(getCardEmbedUrl("https://youtu.be/w0_fK4r7Yrs")).toBe(
			"https://www.youtube-nocookie.com/embed/w0_fK4r7Yrs?autoplay=1",
		);
	});

	it("builds a click-to-play embed for vimeo", () => {
		expect(getCardEmbedUrl("https://vimeo.com/1152950764")).toBe(
			"https://player.vimeo.com/video/1152950764?autoplay=1",
		);
	});
});

describe("getThumbnailUrl", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("builds a predictable thumbnail url for youtube without any network call", async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal("fetch", fetchSpy);
		const url = await getThumbnailUrl("https://youtu.be/w0_fK4r7Yrs");
		expect(url).toBe("https://i.ytimg.com/vi/w0_fK4r7Yrs/hqdefault.jpg");
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("fetches the vimeo oEmbed thumbnail", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					thumbnail_url: "https://i.vimeocdn.com/thumb.jpg",
				}),
			}),
		);
		const url = await getThumbnailUrl("https://vimeo.com/1152950764");
		expect(url).toBe("https://i.vimeocdn.com/thumb.jpg");
	});

	it("returns undefined when the vimeo oEmbed request fails", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
		const url = await getThumbnailUrl("https://vimeo.com/1152950764");
		expect(url).toBeUndefined();
	});
});
