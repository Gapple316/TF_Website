import { describe, it, expect, beforeEach, vi } from "vitest";
import { initVideoPlayer } from "./video-player";

/**
 * jsdom kennt die Fullscreen-API nicht. Für den Test genügt es,
 * requestFullscreen zu ersetzen und document.fullscreenElement von Hand zu
 * setzen – geprüft wird die Verdrahtung, nicht der Browser.
 */
function rueste(frame: HTMLIFrameElement) {
	(frame as unknown as { requestFullscreen: () => Promise<void> }).requestFullscreen = vi
		.fn()
		.mockResolvedValue(undefined);
}

function setzeFullscreen(el: Element | null) {
	Object.defineProperty(document, "fullscreenElement", {
		value: el,
		configurable: true,
		writable: true,
	});
}

function paar(id: string, src: string) {
	return `
		<button type="button" data-video-play="${id}"></button>
		<iframe data-video-frame="${id}" data-src="${src}" class="hidden"></iframe>
	`;
}

const btnVon = (id: string) =>
	document.querySelector<HTMLButtonElement>(`[data-video-play="${id}"]`)!;
const frameVon = (id: string) =>
	document.querySelector<HTMLIFrameElement>(`[data-video-frame="${id}"]`)!;

describe("initVideoPlayer", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
		setzeFullscreen(null);
	});

	it("lädt die iframe erst beim Klick", () => {
		document.body.innerHTML = paar("eins", "https://example.com/eins");
		rueste(frameVon("eins"));
		initVideoPlayer();

		expect(frameVon("eins").getAttribute("src")).toBeNull();

		btnVon("eins").click();

		expect(frameVon("eins").getAttribute("src")).toBe("https://example.com/eins");
		expect(frameVon("eins").classList.contains("hidden")).toBe(false);
	});

	it("bedient mehrere Filme auf einer Seite unabhängig voneinander", () => {
		document.body.innerHTML =
			paar("eins", "https://example.com/eins") +
			paar("zwei", "https://example.com/zwei") +
			paar("drei", "https://example.com/drei");
		for (const id of ["eins", "zwei", "drei"]) rueste(frameVon(id));
		initVideoPlayer();

		btnVon("zwei").click();

		expect(frameVon("zwei").getAttribute("src")).toBe("https://example.com/zwei");
		// Die anderen bleiben unangetastet.
		expect(frameVon("eins").getAttribute("src")).toBeNull();
		expect(frameVon("drei").getAttribute("src")).toBeNull();
	});

	it("ordnet jedem Knopf die iframe mit derselben Kennung zu", () => {
		// Reihenfolge im Markup bewusst vertauscht.
		document.body.innerHTML = `
			<button type="button" data-video-play="b"></button>
			<button type="button" data-video-play="a"></button>
			<iframe data-video-frame="a" data-src="https://example.com/a" class="hidden"></iframe>
			<iframe data-video-frame="b" data-src="https://example.com/b" class="hidden"></iframe>
		`;
		for (const id of ["a", "b"]) rueste(frameVon(id));
		initVideoPlayer();

		btnVon("a").click();

		expect(frameVon("a").getAttribute("src")).toBe("https://example.com/a");
		expect(frameVon("b").getAttribute("src")).toBeNull();
	});

	it("entlädt die iframe beim Verlassen des Fullscreens", () => {
		document.body.innerHTML = paar("eins", "https://example.com/eins");
		rueste(frameVon("eins"));
		initVideoPlayer();

		btnVon("eins").click();
		setzeFullscreen(frameVon("eins"));
		document.dispatchEvent(new Event("fullscreenchange"));
		expect(frameVon("eins").getAttribute("src")).toBe("https://example.com/eins");

		setzeFullscreen(null);
		document.dispatchEvent(new Event("fullscreenchange"));

		expect(frameVon("eins").getAttribute("src")).toBeNull();
		expect(frameVon("eins").classList.contains("hidden")).toBe(true);
	});

	it("stört sich nicht an einem Knopf ohne passende iframe", () => {
		document.body.innerHTML = `<button type="button" data-video-play="verwaist"></button>`;
		expect(() => initVideoPlayer()).not.toThrow();
		expect(() => btnVon("verwaist").click()).not.toThrow();
	});

	it("meldet die Handler beim erneuten Aufruf ab (View Transitions)", () => {
		document.body.innerHTML = paar("eins", "https://example.com/eins");
		rueste(frameVon("eins"));
		initVideoPlayer();

		const alterKnopf = btnVon("eins");
		const abmelden = vi.spyOn(alterKnopf, "removeEventListener");

		// Zweiter Seitenaufbau: initVideoPlayer läuft erneut.
		initVideoPlayer();

		expect(abmelden).toHaveBeenCalledWith("click", expect.any(Function));
	});

	it("tut nichts, wenn die Seite gar kein Video hat", () => {
		document.body.innerHTML = `<p>kein Video</p>`;
		expect(() => initVideoPlayer()).not.toThrow();
	});
});
