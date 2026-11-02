// Statischer Endpunkt: erzeugt beim Bauen je Screening ein Ticketbild für die
// Link-Vorschau in Mail und WhatsApp. Ergebnis landet als
// /screening/<slug>/ticket.png im Build.

import type { APIRoute } from "astro";
import { screenings, type Screening } from "../../../data/screenings";
import { erzeugeTicketBild } from "../../../lib/ticket-bild";

export function getStaticPaths() {
	return screenings.map((screening) => ({
		params: { slug: screening.slug },
		props: { screening },
	}));
}

export const GET: APIRoute = async ({ props }) => {
	const png = await erzeugeTicketBild((props as { screening: Screening }).screening);

	return new Response(new Uint8Array(png), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
