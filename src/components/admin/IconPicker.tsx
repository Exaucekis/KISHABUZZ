"use client";

const ICONS = [
  { emoji: "🎵", label: "Musique" },
  { emoji: "🎤", label: "Micro" },
  { emoji: "🎙️", label: "Podcast" },
  { emoji: "🎧", label: "Audio" },
  { emoji: "📻", label: "Radio" },
  { emoji: "🎬", label: "Cinéma" },
  { emoji: "🎥", label: "Vidéo" },
  { emoji: "📹", label: "Caméscope" },
  { emoji: "📷", label: "Appareil photo" },
  { emoji: "📸", label: "Photo" },
  { emoji: "📺", label: "TV" },
  { emoji: "📡", label: "Broadcast" },
  { emoji: "💻", label: "Ordinateur" },
  { emoji: "🖥️", label: "Écran" },
  { emoji: "⌨️", label: "Clavier" },
  { emoji: "🖱️", label: "Souris" },
  { emoji: "📱", label: "Mobile" },
  { emoji: "🌐", label: "Web" },
  { emoji: "⚙️", label: "Tech" },
  { emoji: "🧠", label: "IA" },
  { emoji: "🤖", label: "Robot" },
  { emoji: "💾", label: "Data" },
  { emoji: "📊", label: "Stats" },
  { emoji: "🚀", label: "Innovation" },
  { emoji: "📰", label: "Presse" },
  { emoji: "✍️", label: "Écriture" },
  { emoji: "📣", label: "Com" },
  { emoji: "🎯", label: "Marketing" },
  { emoji: "💡", label: "Idée" },
  { emoji: "🔥", label: "Buzz" },
  { emoji: "🎭", label: "Spectacle" },
  { emoji: "🎨", label: "Art" },
  { emoji: "👗", label: "Mode" },
  { emoji: "🏟️", label: "Événement" },
  { emoji: "🏆", label: "Sport" },
  { emoji: "🤝", label: "Partenaire" },
  { emoji: "💼", label: "Business" },
  { emoji: "🌍", label: "Culture" },
] as const;

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  return (
    <div className="admin-icon-picker" role="listbox" aria-label="Choisir une icône">
      {ICONS.map((item) => {
        const selected = value === item.emoji;
        return (
          <button
            key={item.emoji}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={item.label}
            title={item.label}
            className={`admin-icon-pick${selected ? " is-on" : ""}`}
            onClick={() => onChange(selected ? "" : item.emoji)}
          >
            {item.emoji}
          </button>
        );
      })}
    </div>
  );
}
