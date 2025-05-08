import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Lightbulb, Box, Layers, Database } from "lucide-react";

// Composant pour un élément de la liste avec animation
const TechItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <li className="flex items-center py-1">
      <span className="bg-primary-100 text-primary-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
        ✓
      </span>
      <span className="text-secondary-800">{children}</span>
    </li>
  );
};

// Composant pour une section de la stack
const TechSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentType;
  children: React.ReactNode;
}) => {
  const Icon: React.ComponentType<React.HTMLAttributes<HTMLSpanElement>> = icon;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-secondary-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-3">
        <Icon className="w-5 h-5 text-primary-500 mr-2" />
        <h3 className="font-semibold text-secondary-800">{title}</h3>
      </div>
      <ul className="text-sm space-y-1">{children}</ul>
    </div>
  );
};

// Composant principal
export function StackDescription() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-xl shadow-sm border border-secondary-100">
      <div className="mb-8 bg-white p-5 rounded-lg border border-secondary-100 text-secondary-700 shadow-sm">
        <div className="flex items-start mb-3">
          <Lightbulb className="w-6 h-6 text-primary-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold mb-3 text-primary-700">
              Projet TanStack Query & Next.js
            </h2>
            <p className="mb-2">
              Ce projet est un terrain de jeu pour maîtriser TanStack Query
              (React Query) dans un contexte Next.js.
            </p>
            <p className="mb-2">
              Au programme : fetching asynchrone optimisé, gestion d'erreurs
              élégante, cache intelligent, et intégration fluide avec le
              SSR/SSG.
            </p>
            <p>
              J'y expérimente les patterns recommandés pour des composants
              propres et performants.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center">
        <Layers className="w-6 h-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-bold text-secondary-900">
          Stack Technique
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <TechSection title="Frontend" icon={Box}>
          <TechItem>Next.js (App Router)</TechItem>
          <TechItem>Tailwind CSS</TechItem>
          <TechItem>shadcn/ui</TechItem>
        </TechSection>

        <TechSection title="Gestion des Données" icon={Database}>
          <TechItem>TanStack Query v5</TechItem>
          <TechItem>React Hooks personnalisés</TechItem>
          <TechItem>LocalStorage pour les favoris</TechItem>
        </TechSection>

        <TechSection title="API & Services" icon={ExternalLink}>
          <TechItem>TMDB API (The Movie Database)</TechItem>
          <TechItem>Pagination infinie</TechItem>
          <TechItem>Mise en cache optimisée</TechItem>
        </TechSection>
      </div>
    </div>
  );
}
