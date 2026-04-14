import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 py-10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/LEADBY-Logo.png"
            alt="LeadBy"
            width={36}
            height={36}
            className="h-9 w-9 flex-shrink-0 object-contain"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">LeadBy</span>
        </Link>

        <div className="flex flex-wrap items-center gap-6 text-sm text-black/60 dark:text-white/60">
          <Link href="/legal/terms" className="transition-colors hover:text-black dark:hover:text-white">
            Términos
          </Link>
          <Link href="/legal/privacy" className="transition-colors hover:text-black dark:hover:text-white">
            Pol&#237;tica de Privacidad
          </Link>
          <Link href="/legal/cookies" className="transition-colors hover:text-black dark:hover:text-white">
            Cookies
          </Link>
        </div>

        <p className="text-xs text-black/50 dark:text-white/50">© {year} LeadBy</p>
      </div>
    </footer>
  );
}
