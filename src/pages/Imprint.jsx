import React from 'react';

export default function Imprint() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Impressum</h1>
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <p>
          <strong>Angaben gemäß § 5 TMG</strong>
        </p>
        <p>
          DreamWeaver<br />
          Max Mustermann<br />
          Musterstraße 1<br />
          12345 Musterstadt<br />
          Deutschland
        </p>
        <p>
          <strong>Kontakt:</strong><br />
          Telefon: +49 (0) 123 456789<br />
          E-Mail: kontakt@dreamweaver.de
        </p>
        <p>
          <strong>Vertreten durch:</strong><br />
          Max Mustermann (Inhaber)
        </p>
        <p>
          <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
          Max Mustermann<br />
          Musterstraße 1, 12345 Musterstadt
        </p>
        <p>
          <strong>Haftungsausschluss:</strong>
        </p>
        <p>
          Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
          Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
        </p>
        <p>
          <strong>Urheberrecht:</strong><br />
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
        </p>
      </div>
    </div>
  );
}