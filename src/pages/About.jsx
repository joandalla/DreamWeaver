import React from 'react';
import Button from '../components/Button';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6 dark:text-white">Über DreamWeaver</h1>
      <div className="prose dark:prose-invert">
        <p>
          DreamWeaver ist eine kreative Plattform, die es dir ermöglicht, digitale Kunstwerke im Stil des berühmten Action Painters Jackson Pollock zu erschaffen. 
          Statt mit Pinsel und Farbe arbeitest du mit Parametern – Dichte, Chaos, Gravitation und mehr – und lässt den Zufall walten.
        </p>
        <p>
          Inspiriert von Pollocks Technik, Farbe aus der Dose auf die Leinwand tropfen zu lassen, simuliert DreamWeaver physikalische Prozesse wie nicht-newtonsche Viskosität, Tropfenbildung und Farbverläufe. 
          Das Ergebnis ist jedes Mal ein einzigartiges, abstraktes Bild.
        </p>
        <h2 className="text-2xl font-semibold mt-8">Wie funktioniert's?</h2>
        <ul>
          <li>Wähle deine Farbpalette – klassische Pollock-Farben oder eigene Kreationen.</li>
          <li>Passe Parameter an wie Dichte, Chaos, Linienstärke und Gravitation.</li>
          <li>Klicke auf "Neu generieren" und lass dich überraschen.</li>
          <li>Speichere deine Lieblingsbilder in deiner Galerie und teile sie mit der Community.</li>
        </ul>
        <p className="mt-8">
          DreamWeaver wurde im Rahmen eines React-Projekts entwickelt und verbindet moderne Webtechnologien mit künstlerischer Freiheit.
        </p>
      </div>
      <div className="mt-8 text-center">
        <Button variant="primary" onClick={() => window.location.href = '/weave'}>
          Jetzt starten
        </Button>
      </div>
    </div>
  );
}