import { describe, it, expect, beforeEach, vi } from "vitest";
import { initHeaderContrast } from "./header-contrast";

class FakeIntersectionObserver {
	static instances: FakeIntersectionObserver[] = [];
	callback: IntersectionObserverCallback;

	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback;
		FakeIntersectionObserver.instances.push(this);
	}

	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();

	trigger(isIntersecting: boolean) {
		this.callback(
			[{ isIntersecting } as IntersectionObserverEntry],
			this as unknown as IntersectionObserver,
		);
	}
}

function setupDom() {
	document.body.innerHTML = `<header></header><section id="hero"></section>`;
}

describe("initHeaderContrast", () => {
	beforeEach(() => {
		setupDom();
		FakeIntersectionObserver.instances = [];
		vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
	});

	it("marks the header as over-hero while the hero is intersecting the viewport", () => {
		initHeaderContrast();
		const [observer] = FakeIntersectionObserver.instances;
		observer.trigger(true);
		const header = document.querySelector("header")!;
		expect(header.dataset.overHero).toBe("true");
	});

	it("marks the header as not-over-hero once the hero has scrolled out of view", () => {
		initHeaderContrast();
		const [observer] = FakeIntersectionObserver.instances;
		observer.trigger(false);
		const header = document.querySelector("header")!;
		expect(header.dataset.overHero).toBe("false");
	});

	it("does nothing when the page has no hero", () => {
		document.body.innerHTML = `<header></header>`;
		expect(() => initHeaderContrast()).not.toThrow();
		const header = document.querySelector("header")!;
		expect(header.dataset.overHero).toBeUndefined();
	});

	it("does nothing when there is no header", () => {
		document.body.innerHTML = `<section id="hero"></section>`;
		expect(() => initHeaderContrast()).not.toThrow();
	});
});
