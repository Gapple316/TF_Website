// Kundenstimmen für die Landingpage. Die Texte stammen wortgleich von den
// Kundinnen und Kunden selbst – beim Kürzen oder Umformulieren würde der
// Charakter verloren gehen, deshalb stehen sie vollständig hier.
//
// Eine Stimme ergänzen: Eintrag unten anhängen, Foto (optional) nach
// public/images/testimonials/ legen. Ohne Foto rendert die Karte einfach
// ohne Portrait weiter.

export interface Testimonial {
	/** Absätze des Zitats – getrennt, damit lange Texte lesbar bleiben. */
	quote: string[];
	name: string;
	role: string;
	image?: string;
	imageAlt?: string;
}

export const testimonials: Testimonial[] = [
	{
		quote: [
			"Wir arbeiten schon seit einiger Zeit mit Gabriel zusammen und schätzen ihn und seine Fähigkeiten im Bereich Video, Schnitt und Shootings sehr. Sein Auge für das Wesentliche – sowohl beim Filmen als auch beim Schnitt – entspricht genau unseren Erwartungen und denen unserer Kunden.",
			"Als Werbeagentur, die Videoproduktionen meist outsourct, sind die Klickraten und Views der von Gabriel produzierten Videos wesentliche Kennzahlen. Seit wir die Videoproduktion in seine Hände gelegt haben, konnten wir die Klickraten und Views noch einmal deutlich steigern, was uns wiederum zeigt, dass er definitiv sein Handwerk beherrscht.",
			"Deadlines und Pünktlichkeit erwähne ich nicht extra, denn die sind in dieser Branche besonders wichtig, und auch hier wurden wir noch nie im Stich gelassen. Abschließend können wir nur sagen: Wer einen jungen, dynamischen Filmemacher braucht, der ausgezeichnete Arbeit pünktlich liefert, ist bei Gabriel genau an der richtigen Adresse.",
		],
		name: "Stefan & Walter",
		role: "GS8 Campus GmbH",
		image: "/images/testimonials/stefan-grabler.jpg",
		imageAlt: "Stefan Grabler, GS8 Campus GmbH",
	},
	{
		quote: [
			"Die Zusammenarbeit mit Gabriel bei unserem ersten gemeinsamen Projekt war eine wirklich großartige Erfahrung. Von Anfang an war die Zusammenarbeit unkompliziert, professionell und sehr produktiv. Gabriel ist unglaublich freundlich, offen und bringt eine sehr positive Energie in den gesamten Arbeitsprozess.",
			"Besonders beeindruckt hat uns, wie schnell und effizient er arbeitet, ohne dabei Kompromisse bei der Qualität einzugehen. Die Professionalität seiner Arbeit ist auf höchstem Niveau, sowohl die Videos selbst als auch der Schnitt sind von ausgezeichneter Qualität. Darüber hinaus hat Gabriel uns enorm entlastet, da wir uns weder um Voice-over, Musik noch um Sprecher in verschiedenen Sprachen kümmern mussten – er hat alles selbstständig organisiert und unglaublich schnell umgesetzt.",
			"Wir sind uns vollkommen sicher, dass wir auch unsere nächsten Projekte gemeinsam mit Gabriel umsetzen werden, und freuen uns schon jetzt sehr darauf. Es ist wirklich eine große Freude, mit ihm zusammenzuarbeiten.",
		],
		name: "Gerhard Weiss",
		role: "Geschäftsführer Aqus GmbH",
	},
	{
		quote: [
			"Klare Ansagen. Klare Bilder. Klare Sache. Gabriel Neumayr ist ein Filmemacher, der nicht lange um den heißen Brei redet – und genau das macht die Zusammenarbeit so stark.",
			"Was ich besonders schätze: Gabriel bringt nicht nur die Kamera mit, sondern auch seine eigene Expertise. Klar, als Unternehmen hat man eine Vorstellung davon, wie ein Video aussehen soll. Aber richtig gut wird es dann, wenn jemand wie Gabriel seine Perspektive, Erfahrung und Ideen mit reinbringt. Und genau das tut er.",
			"Er ist extrem on point. Termine sind Termine, ein Ja ist ein Ja und ein Nein ist ein Nein. Dadurch wird nicht unnötig Zeit verbrannt, sondern fokussiert, effizient und produktiv gearbeitet.",
			'Und dann kommt noch die Extra-Meile: Gabriel denkt mit. Er bringt zusätzliche Ideen ein, entwickelt beispielsweise Intros oder andere Elemente, die das Ergebnis noch einmal auf ein anderes Level bringen. Er gibt dem Kunden nicht einfach das, was bestellt wurde – er versucht, ein bisschen mehr daraus zu machen. Und genau da entsteht für mich der Unterschied zwischen „zufrieden“ und „positiv überrascht“.',
			"Ich arbeite als High Performance Coach mit Großkonzernen und Profisportlern und bin deshalb ziemlich vorsichtig damit, wen ich in diesem Umfeld weiterempfehle. Bei Gabriel würde ich es machen. Jung, dynamisch, ambitioniert, professionell – und vor allem jemand, der liefert. Klare Empfehlung. Und definitiv nicht das letzte gemeinsame Projekt.",
		],
		name: "Dipl. FW Alexander Egger, MTD",
		role: "High Performance & Neuroperformance Specialist",
		image: "/images/testimonials/alexander-egger.jpg",
		imageAlt: "Alexander Egger, High Performance & Neuroperformance Specialist",
	},
];
