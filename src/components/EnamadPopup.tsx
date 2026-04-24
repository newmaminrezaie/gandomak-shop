import { useEffect, useState } from "react";
import { X } from "lucide-react";
import enamadSeal from "@/assets/trust/enamad.jpg";

const STORAGE_KEY = "enamad-popup-dismissed";

export default function EnamadPopup() {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;

    const showTimer = window.setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setEntered(true))
      );
    }, 10000);

    return () => window.clearTimeout(showTimer);
  }, []);

  const dismiss = () => {
    setEntered(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
    window.setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-label="نماد اعتماد الکترونیکی"
      className={[
        "fixed z-50 left-4 bottom-4 sm:left-6 sm:bottom-6",
        "transition-all duration-500 ease-out will-change-transform",
        entered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      ].join(" ")}
    >
      <div className="relative">
        <button
          type="button"
          onClick={dismiss}
          aria-label="بستن"
          className="absolute -top-2 -left-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background text-foreground shadow-elegant border border-border hover:scale-110 transition-transform"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <a
          target="_blank"
          rel="noreferrer"
          href="https://trustseal.enamad.ir/?id=655583&Code=i679RnaSXE7EUpN1xFeht0NynDKCAwub"
          aria-label="نماد اعتماد الکترونیکی"
          className="block rounded-md overflow-hidden shadow-elegant hover:scale-[1.02] transition-transform"
        >
          <img
            src={enamadSeal}
            alt="نماد اعتماد الکترونیکی"
            referrerPolicy="origin"
            data-enamad-code="i679RnaSXE7EUpN1xFeht0NynDKCAwub"
            className="block h-24 w-24 sm:h-28 sm:w-28 object-cover"
          />
        </a>
      </div>
    </div>
  );
}
