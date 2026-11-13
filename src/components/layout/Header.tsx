"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { KubarLockup } from "@/components/brand/KubarMark";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { reader } from "@/lib/copy";
import { cx as cn } from "@/lib/cx";

/*
 * Header (Figma C3 87:142). Fixed on scroll on every page (option B).
 * Desktop (≥ 1200): lock-up, Products (menu on click), How it works, About,
 * Contact; LinkedIn and "Talk to us" on the right; a double rule under it.
 * Below 1200 the links collapse into "Menu", which opens a full-screen sheet
 * (a modal <dialog>: focus stays inside, Escape closes, the page behind
 * doesn't scroll, focus returns to Menu).
 */

const LINKEDIN = "https://www.linkedin.com/company/kubarlabs/";
const DESKTOP = "(min-width: 1200px)";

const navItem =
  "t-ui inline-flex items-center gap-1 py-3 text-ink decoration-1 " +
  "[text-underline-position:from-font] hover:underline";
const navItemCurrent = "underline decoration-2 hover:decoration-2";

function DoubleRule() {
  return <div aria-hidden="true" className="h-[5px] border-y border-rule-strong" />;
}

export function Header({ copy }: { /** The "header" messages. */ copy: unknown }) {
  const t = reader(copy);
  const pathname = usePathname();
  const menuId = useId();

  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const productsButtonRef = useRef<HTMLButtonElement>(null);

  const sheetRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const pages = [
    { href: "/how-it-works", label: t("howItWorks") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];
  const products = [
    {
      href: "/products/kubar-protocol",
      name: t("menuProducts.kubarProtocol.name"),
      line: t("menuProducts.kubarProtocol.line"),
    },
    {
      href: "/products/navdhan-sdk",
      name: t("menuProducts.navdhanSdk.name"),
      line: t("menuProducts.navdhanSdk.line"),
    },
  ];
  const onProductPage = pathname.startsWith("/products/");

  // Products menu: close on a click outside.
  useEffect(() => {
    if (!productsOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!productsRef.current?.contains(event.target as Node)) setProductsOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [productsOpen]);

  // Crossing the desktop breakpoint closes whichever menu doesn't belong there.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    function onChange() {
      if (query.matches) sheetRef.current?.close();
      else setProductsOpen(false);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  function onProductsKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && productsOpen) {
      event.stopPropagation();
      setProductsOpen(false);
      productsButtonRef.current?.focus();
    }
  }

  function onProductsBlur(event: React.FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && !productsRef.current?.contains(next)) setProductsOpen(false);
  }

  function openSheet() {
    sheetRef.current?.showModal();
    setSheetOpen(true);
  }
  function closeSheet() {
    sheetRef.current?.close();
  }
  function onSheetClose() {
    setSheetOpen(false);
    menuButtonRef.current?.focus();
  }
  // Keep Tab inside the sheet: wrap from the last control to the first.
  function onSheetKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const focusable = event.currentTarget.querySelectorAll<HTMLElement>("a[href], button");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-page">
      <div className="page-container flex h-[60px] items-center justify-between max-lg:pr-2 lg:h-[76px]">
        <Link href="/" aria-label={t("homeLabel")} className="text-mark">
          <KubarLockup height={24} className="lg:hidden" />
          <KubarLockup height={28} className="hidden lg:block" />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label={t("primaryNav")} className="hidden lg:block">
          <ul className="flex items-center gap-8">
            <li>
              <div ref={productsRef} className="relative" onKeyDown={onProductsKeyDown} onBlur={onProductsBlur}>
                <button
                  ref={productsButtonRef}
                  type="button"
                  aria-expanded={productsOpen}
                  aria-controls={menuId}
                  onClick={() => setProductsOpen((open) => !open)}
                  className={cn(navItem, "cursor-pointer", (productsOpen || onProductPage) && navItemCurrent)}
                >
                  {t("products")}
                  <Icon name="chevron-down" className={cn("shrink-0", productsOpen && "rotate-180")} />
                </button>
                <div
                  id={menuId}
                  data-open={productsOpen}
                  className={cn(
                    "absolute top-[calc(100%+21px)] left-[-17px] w-[400px] border border-rule-control bg-raised py-2",
                    "transition-[opacity,translate,visibility] duration-(--duration-disclose)",
                    productsOpen
                      ? "visible translate-y-0 opacity-100 ease-standard"
                      : "invisible -translate-y-2 opacity-0 ease-exit",
                  )}
                >
                  <ul>
                    {products.map((product) => (
                      <li key={product.href}>
                        <Link
                          href={product.href}
                          aria-current={pathname === product.href ? "page" : undefined}
                          onClick={() => setProductsOpen(false)}
                          className="flex flex-col gap-1 p-4 transition-colors duration-(--duration-hover) ease-standard hover:bg-action-soft"
                        >
                          <span className="t-ui text-ink">{product.name}</span>
                          <span className="t-body-sm text-ink-muted">{product.line}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
            {pages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  aria-current={pathname === page.href ? "page" : undefined}
                  className={cn(navItem, pathname === page.href && navItemCurrent)}
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("linkedinLabel")}
            className={navItem}
          >
            {t("linkedin")}
            <Icon name="arrow-up-right" className="shrink-0" />
          </a>
          <ButtonLink href="/contact" size={44}>
            {t("talkToUs")}
          </ButtonLink>
        </div>

        {/* Below desktop: the Menu button */}
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={sheetOpen}
          aria-haspopup="dialog"
          onClick={openSheet}
          className="t-ui h-11 w-16 cursor-pointer px-3 text-ink transition-colors duration-(--duration-hover) ease-standard hover:bg-action-soft lg:hidden"
        >
          {t("menu")}
        </button>
      </div>
      <DoubleRule />

      <dialog ref={sheetRef} aria-label={t("sheetLabel")} onClose={onSheetClose} onKeyDown={onSheetKeyDown} className="menu-sheet">
        <div className="page-container flex h-[60px] items-center justify-between pr-2">
          <Link href="/" aria-label={t("homeLabel")} className="text-mark" onClick={closeSheet}>
            <KubarLockup height={24} />
          </Link>
          <button
            type="button"
            autoFocus
            onClick={closeSheet}
            className="t-ui h-11 w-16 cursor-pointer px-3 text-ink transition-colors duration-(--duration-hover) ease-standard hover:bg-action-soft"
          >
            {t("close")}
          </button>
        </div>
        <DoubleRule />
        <nav aria-label={t("primaryNav")} className="page-container flex flex-col gap-8 pt-6 pb-10">
          <div>
            <p className="t-tag pb-2 text-ink-muted">{t("products")}</p>
            <ul>
              {products.map((product, index) => (
                <li key={product.href} className={cn("border-t border-rule", index === products.length - 1 && "border-b")}>
                  <Link
                    href={product.href}
                    aria-current={pathname === product.href ? "page" : undefined}
                    onClick={closeSheet}
                    className="flex flex-col gap-1 py-4"
                  >
                    <span className="flex items-center justify-between">
                      <span className="t-ui-lg text-ink">{product.name}</span>
                      <Icon name="arrow-right" className="shrink-0" />
                    </span>
                    <span className="t-body-sm text-ink-muted">{product.line}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <ul>
            {pages.map((page) => (
              <li key={page.href} className="border-t border-rule">
                <Link
                  href={page.href}
                  aria-current={pathname === page.href ? "page" : undefined}
                  onClick={closeSheet}
                  className="t-ui-lg flex items-center justify-between py-4 text-ink"
                >
                  {page.label}
                  <Icon name="arrow-right" className="shrink-0" />
                </Link>
              </li>
            ))}
            <li className="border-y border-rule">
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("linkedinLabel")}
                className="t-ui-lg flex items-center justify-between py-4 text-ink"
              >
                {t("linkedin")}
                <Icon name="arrow-up-right" className="shrink-0" />
              </a>
            </li>
          </ul>
          <ButtonLink href="/contact" size={48} className="w-full" onClick={closeSheet}>
            {t("talkToUs")}
          </ButtonLink>
        </nav>
      </dialog>
    </header>
  );
}
