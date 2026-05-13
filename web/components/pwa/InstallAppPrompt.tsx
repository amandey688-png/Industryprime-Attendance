"use client";

import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "industryprime-pwa-install-dismissed";

export function InstallAppPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const onDismiss = useCallback(() => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const onInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    setDeferred(null);
    onDismiss();
  }, [deferred, onDismiss]);

  if (dismissed || !deferred) return null;

  return (
    <div
      className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[200] border-t border-emerald-700/30 bg-emerald-950/95 p-4 text-emerald-50 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md md:left-auto md:right-4 md:bottom-4 md:max-w-md md:rounded-2xl md:border"
      role="dialog"
      aria-label="Install app"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Install IndustryPrime Attendance</p>
          <p className="mt-0.5 text-xs text-emerald-200/90">
            Add to your home screen for a full-screen app experience (same login and data).
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-white/10"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => void onInstall()}
            className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-50"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
