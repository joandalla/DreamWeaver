import React from 'react';

export default function Imprint() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Impressum</h1>
      <div className="prose dark:prose-invert">
        <p>Angaben gemäß § 5 TMG</p>
        <p>
          DreamWeaver<br />
          Musterstraße 1<br />
          12345 Musterstadt
        </p>
        <h2>Vertreten durch</h2>
        <p>Max Mustermann</p>
        <h2>Kontakt</h2>
        <p>
          Telefon: +49 123 456789<br />
          E-Mail: info@dreamweaver.example
        </p>
        <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p>Max Mustermann, Musterstraße 1, 12345 Musterstadt</p>
        <h2>Haftung für Inhalte</h2>
        <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
        <h2>Haftung für Links</h2>
        <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>
      </div>
    </div>
  );
}