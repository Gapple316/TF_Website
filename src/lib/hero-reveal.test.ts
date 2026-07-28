import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initHeroReveal } from "./hero-reveal";

function setupDom() {
	document.body.innerHTML = `<div data-hero-reveal></div>`;
}

describe("initHeroReveal", () => {
	beforeEach(() => {
		setupDom();
		vi.useFakeTimers();
		window.matchMedia = vi
			.fn()
			.mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("does not reveal immediately", () => {
		initHeroReveal();
		const el = document.querySelector("[data-hero-reveal]")!;
		expect(el.classList.contains("is-revealed")).toBe(false);
	});

	it("reveals automatically after 2000ms", () => {
		initHeroReveal();
		const el = document.querySelector("[data-hero-reveal]")!;
		vi.advanceTimersByTime(2000);
		expect(el.classList.contains("is-revealed")).toBe(true);
	});

	it("reveals immediately on scroll before the delay elapses", () => {
		initHeroReveal();
		const el = document.querySelector("[data-hero-reveal]")!;
		vi.advanceTimersByTime(500);
		window.dispatchEvent(new Event("scroll"));
		expect(el.classList.contains("is-revealed")).toBe(true);
	});

	it("reveals immediately when reduced motion is preferred", () => {
		window.matchMedia = vi
			.fn()
			.mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
		initHeroReveal();
		const el = document.querySelector("[data-hero-reveal]")!;
		expect(el.classList.contains("is-revealed")).toBe(true);
	});

	it("does nothing when no hero-reveal element is present", () => {
		document.body.innerHTML = "";
		expect(() => initHeroReveal()).not.toThrow();
	});
});
