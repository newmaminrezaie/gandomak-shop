import { CATEGORIES } from "@/data/products";

type Props = {
  active: string;
  onChange: (cat: string) => void;
};

export default function CategoryChips({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
      {CATEGORIES.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`shrink-0 px-4 h-10 rounded-full text-sm font-semibold transition-smooth border ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-soft"
                : "bg-card text-foreground/75 border-border hover:border-accent hover:text-primary"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
