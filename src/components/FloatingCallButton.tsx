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
    <div className="fixed bottom-5 right-5 z-50 animate-scale-in">
      <div className="relative">
        {/* pulsing ring */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary/40 animate-ping"
        />
        <a
          href={`tel:${PHONE_TEL}`}
          aria-label={`تماس با ما ${PHONE_DISPLAY}`}
          title={PHONE_DISPLAY}
          className="relative inline-flex items-center justify-center h-14 w-14 rounded-full gradient-primary text-primary-foreground shadow-elegant hover:scale-105 transition-smooth"
        >
          <Phone className="h-6 w-6" />
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label="بستن"
          className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-card text-muted-foreground border border-border flex items-center justify-center shadow-soft hover:text-foreground transition-smooth"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
