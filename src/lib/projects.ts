import type { CollectionEntry } from "astro:content";

type ProjectData = Pick<CollectionEntry<"projects">["data"], "date" | "year">;

// Sortierschlüssel: das Veröffentlichungsdatum, ersatzweise der 1. Januar des
// Produktionsjahres. Beiträge ganz ohne Zeitangabe landen hinten statt
// vorne – sonst würde ein unvollständig gepflegter Eintrag die Liste anführen.
function sortKey(data: ProjectData): number {
	if (data.date) return data.date.getTime();
	if (data.year) return Date.UTC(data.year, 0, 1);
	return Number.NEGATIVE_INFINITY;
}

/** Vergleichsfunktion für Array.sort: neueste Beiträge zuerst. */
export function byNewestFirst(
	a: { data: ProjectData },
	b: { data: ProjectData },
): number {
	return sortKey(b.data) - sortKey(a.data);
}
