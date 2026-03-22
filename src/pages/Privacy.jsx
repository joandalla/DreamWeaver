import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Datenschutzerklärung</h1>
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <p>
          Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Nachfolgend informieren wir Sie über die Erhebung,
          Verarbeitung und Nutzung Ihrer Daten im Rahmen der Nutzung unserer Webseite.
        </p>
        <h2 className="text-xl font-semibold mt-4 dark:text-white">1. Verantwortliche Stelle</h2>
        <p>
          DreamWeaver<br />
          Max Mustermann<br />
          Musterstraße 1<br />
          12345 Musterstadt<br />
          E-Mail: kontakt@dreamweaver.de
        </p>
        <h2 className="text-xl font-semibold mt-4 dark:text-white">2. Erhebung und Speicherung personenbezogener Daten</h2>
        <p>
          Bei der Registrierung und Nutzung unserer App erheben wir folgende Daten: E-Mail-Adresse, Passwort (verschlüsselt),
          sowie die von Ihnen erstellten Kunstwerke (Bilder, Parameter). Diese Daten werden in unserer Datenbank (MongoDB Atlas)
          gespeichert und dienen der Bereitstellung der Plattform.
        </p>
        <h2 className="text-xl font-semibold mt-4 dark:text-white">3. Zweck der Datenverarbeitung</h2>
        <p>
          Ihre Daten werden verarbeitet, um Ihnen die Nutzung der Plattform zu ermöglichen (Authentifizierung, Erstellung und
          Verwaltung Ihrer Kunstwerke, Interaktion mit anderen Nutzern). Eine Weitergabe an Dritte erfolgt nicht.
        </p>
        <h2 className="text-xl font-semibold mt-4 dark:text-white">4. Speicherdauer</h2>
        <p>
          Ihre Daten werden gespeichert, solange Ihr Benutzerkonto besteht. Bei Löschung Ihres Kontos werden auch Ihre
          persönlichen Daten sowie Ihre Kunstwerke gelöscht.
        </p>
        <h2 className="text-xl font-semibold mt-4 dark:text-white">5. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten sowie
          das Recht auf Datenübertragbarkeit. Wenden Sie sich hierzu an die oben genannte E-Mail-Adresse.
        </p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Stand: März 2026
        </p>
      </div>
    </div>
  );
}