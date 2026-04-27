import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";

const PHONE_TEL = "+989153750234";
const PHONE_DISPLAY = "۰۹۱۵۳۷۵۰۲۳۴";
const STORAGE_KEY = "call_fab_dismissed";

export default function FloatingCallButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    const t = window.setTimeout(() => setVisible(true), 5000);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="relative">
        <a
          href={`tel:${PHONE_TEL}`}
          aria-label={`تماس با ما ${PHONE_DISPLAY}`}
          title={PHONE_DISPLAY}
          className="relative inline-flex items-center justify-center h-11 w-11 rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90 transition-smooth"
        >
          <Phone className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label="بستن"
          className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-card text-muted-foreground/70 border border-border flex items-center justify-center hover:text-foreground transition-smooth"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}
