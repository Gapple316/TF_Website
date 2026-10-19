import { describe, it, expect } from "vitest";
import { byNewestFirst } from "./projects";

const entry = (data: { date?: string; year?: number }) => ({
	data: {
		date: data.date ? new Date(data.date) : undefined,
		year: data.year,
	},
});

describe("byNewestFirst", () => {
	it("sorts by date, newest first", () => {
		const sorted = [
			entry({ date: "2025-03-20" }),
			entry({ date: "2026-10-06" }),
			entry({ date: "2026-01-11" }),
		].sort(byNewestFirst);

		expect(sorted.map((e) => e.data.date?.getFullYear())).toEqual([2026, 2026, 2025]);
		expect(sorted[0].data.date?.getMonth()).toBe(9); // Oktober
	});

	it("falls back to the production year when no date is set", () => {
		const sorted = [entry({ year: 2023 }), entry({ year: 2026 })].sort(byNewestFirst);
		expect(sorted.map((e) => e.data.year)).toEqual([2026, 2023]);
	});

	it("prefers date over year when both are present", () => {
		// Älteres Produktionsjahr, aber später veröffentlicht -> gehört nach oben.
		const sorted = [
			entry({ date: "2025-01-01", year: 2026 }),
			entry({ date: "2026-05-01", year: 2023 }),
		].sort(byNewestFirst);

		expect(sorted[0].data.year).toBe(2023);
	});

	it("puts entries without any date information last", () => {
		const sorted = [entry({}), entry({ year: 2020 })].sort(byNewestFirst);
		expect(sorted[0].data.year).toBe(2020);
		expect(sorted[1].data.year).toBeUndefined();
	});
});
