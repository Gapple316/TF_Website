// Das Abreißen des Kinotickets: ziehen, reißen, wegfliegen.
//
// Kein Fade und kein Wegklappen – es soll sich wie Papier anfühlen. Der
// Abrissstreifen folgt dem Zeiger, die Perforation dehnt sich sichtbar, und ab
// einem gewissen Zug reißt er mit einem Ruck. Ein einfacher Klick löst dieselbe
// Bewegung automatisch aus, damit niemand ziehen MUSS.
//
// Der Flug läuft über eine eigene kleine Physik in requestAnimationFrame:
// Schwung aus der Zugrichtung, Drehung, Schwerkraft. Dafür lohnt keine
// Bibliothek – es sind zehn Zeilen.

const ZUG_BIS_RISS = 70; // Pixel, ab denen das Papier nachgibt
const MAX_ZUG = 110; // weiter lässt sich der Streifen nicht dehnen
const SCHWERKRAFT = 2400; // Pixel pro Sekunde im Quadrat

export interface RissOptionen {
	/** Wird gerufen, sobald der Streifen ab ist. */
	beiRiss: () => void;
	wenigerBewegung: boolean;
}

export function initTicketRiss(
	wurzel: HTMLElement,
	optionen: RissOptionen,
): () => void {
	const ticket = wurzel.querySelector<HTMLElement>("[data-ticket-knopf]");
	const abriss = wurzel.querySelector<HTMLElement>("[data-ticket-abriss]");
	if (!ticket || !abriss) return () => {};

	let zeigerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let zugX = 0;
	let zugY = 0;
	let gerissen = false;
	let frame = 0;
	let letzteZeit = 0;
	/**
	 * Merkt, dass gezogen wurde. Der Abrissstreifen liegt im <button>, also
	 * feuert nach jedem Ziehen auch noch ein Klick. Ohne diese Sperre würde
	 * ein zu kurzer Zug – den die Perforation eigentlich gehalten hat –
	 * anschließend doch das Reißen auslösen.
	 */
	let zugUnterdruecktKlick = false;

	const setzeZug = (dx: number, dy: number) => {
		// Widerstand: je weiter gezogen, desto zäher – wie echtes Papier.
		const gedaempft = Math.sign(dx) * Math.min(Math.abs(dx), MAX_ZUG);
		zugX = gedaempft;
		zugY = dy * 0.35;
		const drehung = (zugX / MAX_ZUG) * 9;
		const spannung = Math.min(Math.abs(zugX) / ZUG_BIS_RISS, 1);

		abriss.style.transform = `translate(${zugX}px, ${zugY}px) rotate(${drehung}deg)`;
		wurzel.style.setProperty("--riss-spannung", String(spannung));
	};

	const zurueck = () => {
		abriss.style.transition = "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
		abriss.style.transform = "";
		wurzel.style.setProperty("--riss-spannung", "0");
		window.setTimeout(() => {
			abriss.style.transition = "";
		}, 360);
	};

	/** Streifen ist ab: Kanten anwenden, wegfliegen lassen, Saal anstoßen. */
	const reissen = (schwungX: number, schwungY: number) => {
		if (gerissen) return;
		gerissen = true;

		wurzel.dataset.kinoRiss = "laeuft";
		if (navigator.vibrate) {
			try {
				navigator.vibrate(18);
			} catch {
				/* Manche Browser verbieten es ohne Geste – dann eben nicht. */
			}
		}

		if (optionen.wenigerBewegung) {
			abriss.style.display = "none";
			wurzel.dataset.kinoRiss = "fertig";
			optionen.beiRiss();
			return;
		}

		// Flug mit eigener Physik.
		let x = zugX;
		let y = zugY;
		let vx = schwungX || 420;
		let vy = schwungY - 320;
		let winkel = (zugX / MAX_ZUG) * 9;
		let dreh = 220 + Math.abs(vx) * 0.3;
		letzteZeit = performance.now();

		const schritt = (jetzt: number) => {
			const dt = Math.min((jetzt - letzteZeit) / 1000, 0.05);
			letzteZeit = jetzt;

			vy += SCHWERKRAFT * dt;
			x += vx * dt;
			y += vy * dt;
			winkel += dreh * dt;

			abriss.style.transform = `translate(${x}px, ${y}px) rotate(${winkel}deg)`;

			if (y < window.innerHeight + 400) {
				frame = requestAnimationFrame(schritt);
			} else {
				abriss.style.display = "none";
			}
		};
		frame = requestAnimationFrame(schritt);

		// Rückstoß des Tickets, dann übernimmt kino.ts.
		wurzel.dataset.kinoRueckstoss = "true";
		window.setTimeout(() => {
			delete wurzel.dataset.kinoRueckstoss;
		}, 420);

		optionen.beiRiss();
	};

	const beiZeigerStart = (e: PointerEvent) => {
		if (gerissen || zeigerId !== null) return;
		zeigerId = e.pointerId;
		startX = e.clientX;
		startY = e.clientY;
		abriss.setPointerCapture(e.pointerId);
		abriss.style.transition = "";
		wurzel.dataset.kinoZieht = "true";
	};

	const beiZeigerBewegung = (e: PointerEvent) => {
		if (zeigerId !== e.pointerId || gerissen) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		if (Math.abs(dx) > 4 || Math.abs(dy) > 4) zugUnterdruecktKlick = true;
		// Nur nach rechts reißen – nach links hält die Perforation.
		setzeZug(Math.max(dx, 0), dy);

		if (zugX >= ZUG_BIS_RISS) {
			loslassen(e, true);
		}
	};

	const loslassen = (e: PointerEvent, durchZug: boolean) => {
		if (zeigerId !== e.pointerId) return;
		try {
			abriss.releasePointerCapture(e.pointerId);
		} catch {
			/* Zeiger schon weg – egal. */
		}
		zeigerId = null;
		delete wurzel.dataset.kinoZieht;

		if (durchZug || zugX >= ZUG_BIS_RISS) {
			reissen(Math.max(zugX * 7, 420), zugY * 7);
		} else {
			zurueck();
		}
	};

	const beiZeigerEnde = (e: PointerEvent) => loslassen(e, false);

	/** Klick ohne Ziehen: dieselbe Bewegung, nur von selbst. */
	const beiKlick = () => {
		if (zugUnterdruecktKlick) {
			zugUnterdruecktKlick = false;
			return;
		}
		if (gerissen || zeigerId !== null) return;
		if (optionen.wenigerBewegung) {
			reissen(0, 0);
			return;
		}
		// Kurz anreißen, dann loslassen – sieht aus wie ein beherzter Ruck.
		abriss.style.transition = "transform 0.18s ease-out";
		setzeZug(ZUG_BIS_RISS * 0.8, 6);
		window.setTimeout(() => {
			abriss.style.transition = "";
			reissen(620, 40);
		}, 190);
	};

	abriss.addEventListener("pointerdown", beiZeigerStart);
	abriss.addEventListener("pointermove", beiZeigerBewegung);
	abriss.addEventListener("pointerup", beiZeigerEnde);
	abriss.addEventListener("pointercancel", beiZeigerEnde);
	ticket.addEventListener("click", beiKlick);

	return () => {
		cancelAnimationFrame(frame);
		abriss.removeEventListener("pointerdown", beiZeigerStart);
		abriss.removeEventListener("pointermove", beiZeigerBewegung);
		abriss.removeEventListener("pointerup", beiZeigerEnde);
		abriss.removeEventListener("pointercancel", beiZeigerEnde);
		ticket.removeEventListener("click", beiKlick);
	};
}
