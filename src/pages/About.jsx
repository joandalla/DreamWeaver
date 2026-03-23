import React from 'react';
import Button from '../components/Button';

export default function About() {
  return (
    <div className="relative overflow-hidden">
      {/* Hintergrundbild (dezent) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20"
        style={{ backgroundImage: "url('/images/pollock-bg.jpg')" }}
      />
      
      <div className="relative max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-6 dark:text-white text-center">
          Über DreamWeaver
        </h1>
        
        {/* Einleitung */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-lg">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            DreamWeaver ist eine interaktive Plattform, die es dir ermöglicht, 
            digitale Kunstwerke im Stil des berühmten Action Painters 
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {" "}Jackson Pollock
            </span> zu erschaffen.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Statt mit Pinsel und Farbe arbeitest du mit Parametern – Dichte, Chaos, 
            Gravitation und mehr – und lässt den Zufall walten. Jedes Bild ist ein Unikat, 
            inspiriert von Pollocks Technik, Farbe aus der Dose auf die Leinwand tropfen zu lassen.
          </p>
        </div>

        {/* Wissenschaftliche Grundlagen */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">
            🧠 Wissenschaftliche Grundlagen
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                Nicht-newtonsche Fluide
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pollocks Farben waren scherverdünnend – sie werden dünnflüssiger, 
                wenn sie schnell fließen. Unser Algorithmus simuliert dieses Verhalten 
                mit einem Power‑Law‑Modell.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                Coiling‑Instabilität
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Viskose Flüssigkeiten bilden beim Fallen automatisch Schlaufen – 
                genau diese Coils sind typisch für Pollocks Linien. Harvard‑Forschung 
                hat gezeigt, dass er diese Instabilität bewusst nutzte.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                Vier‑Schichten‑Modell
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Wissenschaftliche Analysen identifizieren vier unabhängige Schichten 
                in Pollocks Bildern: Hintergrund, organische Formen, Linien und 
                feine Spritzer. DreamWeaver überlagert sie exakt so.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                Fraktale Strukturen
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pollocks Gemälde haben messbare fraktale Dimensionen – kleine 
                Spritzer neben großen Schwüngen. Unsere Parameter steuern diese 
                Mehrskaligkeit.
              </p>
            </div>
          </div>
        </div>

        {/* Technologie-Stack */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">
            ⚙️ Technologie-Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded">
              <span className="text-2xl block">⚛️</span>
              React 19 + Vite
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded">
              <span className="text-2xl block">🎨</span>
              Tailwind CSS
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded">
              <span className="text-2xl block">🚀</span>
              Node.js + Express
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded">
              <span className="text-2xl block">🍃</span>
              MongoDB Atlas
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded">
              <span className="text-2xl block">🌐</span>
              Vercel + Render
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded">
              <span className="text-2xl block">🔒</span>
              JWT + bcrypt
            </div>
          </div>
        </div>

        {/* Call-to-Action */}
        <div className="text-center">
          <Button variant="primary" onClick={() => window.location.href = '/weave'}>
            Jetzt eigenen Traum weben
          </Button>
        </div>
      </div>
    </div>
  );
}