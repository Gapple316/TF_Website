// Erzeugt das Vorschaubild für die Link-Vorschau: ein Kinoticket mit dem
// Namen der Empfängerin bzw. des Empfängers darauf.
//
// Läuft ausschließlich beim Bauen (siehe src/pages/screening/[slug]/ticket.png.ts).
// satori setzt eine Element-Beschreibung in SVG, resvg rastert das SVG zu PNG –
// beide landen nie im Browser des Besuchers.
//
// satori versteht nur einen Teil von CSS: Flexbox ja, Grid nein, und jedes
// Element mit mehreren Kindern braucht ein ausdrückliches "display: flex".
// Deshalb ist der Aufbau hier flacher und ausdrücklicher als im übrigen
// Projekt. Schriften müssen als ttf/otf/woff vorliegen – woff2 kann satori
// nicht lesen, deshalb die .woff-Dateien aus den Fontsource-Paketen.

import { readFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { Screening } from "../data/screenings";
import { TICKET } from "../data/screening-texte";
import { ticketNummer, vollerName, vorstellungsDatum } from "./screening";

export const TICKET_BILD_BREITE = 1200;
export const TICKET_BILD_HOEHE = 630;

const FARBE = {
	hintergrund: "#0b0a09",
	papier: "#efe7d6",
	papierKante: "#ddd2bb",
	tinte: "#1b1813",
	tinteHell: "#6b6253",
	rot: "#c8392f",
	gold: "#b8922f",
};

let schriften: { name: string; data: Buffer; weight: 400; style: "normal" }[] | undefined;

async function ladeSchriften() {
	if (schriften) return schriften;
	const wurzel = process.cwd();
	const [staatliches, courier] = await Promise.all([
		readFile(
			path.join(wurzel, "node_modules/@fontsource/staatliches/files/staatliches-latin-400-normal.woff"),
		),
		readFile(
			path.join(wurzel, "node_modules/@fontsource/courier-prime/files/courier-prime-latin-400-normal.woff"),
		),
	]);
	schriften = [
		{ name: "Staatliches", data: staatliches, weight: 400, style: "normal" },
		{ name: "Courier Prime", data: courier, weight: 400, style: "normal" },
	];
	return schriften;
}

/** Kurzschreibweise für satori-Elemente – erspart JSX in einer .ts-Datei. */
const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({
	type,
	props: children === undefined ? { style } : { style, children },
});

const mono = (groesse: number, farbe: string, spur = 2) => ({
	fontFamily: "Courier Prime",
	fontSize: groesse,
	color: farbe,
	letterSpacing: spur,
});

function ticketBaum(s: Screening) {
	const nummer = ticketNummer(s.slug);
	const datum = vorstellungsDatum(new Date());

	// Perforation: einzelne Punkte statt border-dashed, weil satori
	// gestrichelte Ränder nicht zuverlässig umsetzt.
	const perforation = el(
		"div",
		{
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between",
			alignItems: "center",
			paddingTop: 18,
			paddingBottom: 18,
			width: 2,
			height: "100%",
		},
		Array.from({ length: 18 }, () =>
			el("div", {
				width: 2,
				height: 10,
				backgroundColor: FARBE.papierKante,
				borderRadius: 1,
			}),
		),
	);

	const hauptteil = el(
		"div",
		{
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between",
			flexGrow: 1,
			paddingTop: 44,
			paddingBottom: 44,
			paddingLeft: 56,
			paddingRight: 48,
		},
		[
			el("div", { display: "flex", flexDirection: "column" }, [
				el("div", mono(20, FARBE.tinteHell, 3), TICKET.haus),
				el(
					"div",
					{
						fontFamily: "Staatliches",
						fontSize: 86,
						color: FARBE.tinte,
						letterSpacing: 2,
						marginTop: 10,
						lineHeight: 1,
					},
					TICKET.titel,
				),
				el(
					"div",
					{ ...mono(20, FARBE.rot, 2), marginTop: 12 },
					TICKET.platz,
				),
			]),

			el("div", { display: "flex", flexDirection: "column" }, [
				el("div", mono(20, FARBE.tinteHell, 3), `${TICKET.reserviert.toUpperCase()}:`),
				el(
					"div",
					{
						fontFamily: "Staatliches",
						fontSize: 56,
						color: FARBE.tinte,
						letterSpacing: 1,
						marginTop: 4,
						lineHeight: 1.1,
					},
					vollerName(s),
				),
			]),

			el("div", { display: "flex", flexDirection: "row", alignItems: "flex-end" }, [
				el("div", { display: "flex", flexDirection: "column", flexGrow: 1 }, [
					el("div", mono(18, FARBE.tinteHell, 2), `${TICKET.vorstellung.toUpperCase()}: ${datum}`),
					el(
						"div",
						{ ...mono(18, FARBE.tinteHell, 2), marginTop: 6 },
						`${TICKET.nummer} ${nummer}`,
					),
				]),
				el("div", { ...mono(18, FARBE.gold, 3) }, "TRUE FRAME"),
			]),
		],
	);

	const abschnitt = el(
		"div",
		{
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			width: 210,
			paddingTop: 40,
			paddingBottom: 40,
		},
		[
			el(
				"div",
				{
					...mono(17, FARBE.tinteHell, 4),
					// Hochkant wie auf einem echten Kontrollabschnitt.
					transform: "rotate(-90deg)",
					whiteSpace: "nowrap",
				},
				`${TICKET.abschnitt} · ${TICKET.nummer} ${nummer}`,
			),
		],
	);

	// Feste Maße statt Prozentwerten: satori rechnet height: 100% gegen den
	// Rahmen statt gegen den Inhaltsbereich des gepolsterten Elternteils –
	// die Karte lief dadurch unten aus dem Bild.
	const RAND = 48;

	return el(
		"div",
		{
			display: "flex",
			width: TICKET_BILD_BREITE,
			height: TICKET_BILD_HOEHE,
			backgroundColor: FARBE.hintergrund,
			alignItems: "center",
			justifyContent: "center",
		},
		[
			el(
				"div",
				{
					display: "flex",
					flexDirection: "row",
					width: TICKET_BILD_BREITE - RAND * 2,
					height: TICKET_BILD_HOEHE - RAND * 2,
					backgroundColor: FARBE.papier,
					borderRadius: 10,
				},
				[hauptteil, perforation, abschnitt],
			),
		],
	);
}

/** Erzeugt das PNG für ein Screening. */
export async function erzeugeTicketBild(s: Screening): Promise<Buffer> {
	const fonts = await ladeSchriften();
	const svg = await satori(ticketBaum(s) as never, {
		width: TICKET_BILD_BREITE,
		height: TICKET_BILD_HOEHE,
		fonts,
	});

	const resvg = new Resvg(svg, {
		fitTo: { mode: "width", value: TICKET_BILD_BREITE },
	});
	return resvg.render().asPng();
}
