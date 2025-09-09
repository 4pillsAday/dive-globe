"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { Navbar } from "@/devlink/Navbar";
import { supabase } from "@/lib/supabaseClient";

function rewriteLinks(root: HTMLElement) {
  // Use relative app routes; Next.js basePath will be applied automatically
  const map: Record<string, string> = {
    "/investment-strategies": "/dive",
    "/contact-us": "/about",
    "#home": "/",
    // Add mappings for the incorrect Webflow routes
    "/app": "/",
    "/app/dive": "/dive",
    "/app/about": "/about",
    "/user-profile": "/user-profile",
  };

  const anchors = root.querySelectorAll<HTMLAnchorElement>("a");
  anchors.forEach((a) => {
    const href = a.getAttribute("href") || "";
    const txt = (a.textContent || "").trim().toLowerCase();
    if (href === "#") {
      // Decide by label when href is placeholder
      if (txt.includes("home") || txt.includes("feature")) a.href = map["#home"];
      else if (txt.includes("about")) a.href = "/about";
      else if (txt.includes("dive")) a.href = "/dive";
      else if (txt.includes("log in")) a.href = "/log-in";
      return;
    }
    if (href in map) a.href = map[href];
  });
}

export default function NavbarFixed() {
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const sessionRef = useRef<Session | null>(null);

  function applyAuthVisibility(root: HTMLElement, isLoggedIn: boolean) {
    // Prefer robust selectors that don't rely on CSS module classnames
    const loginLinks = root.querySelectorAll<HTMLAnchorElement>(
      'a[href="/log-in"]'
    );
    const accountLinks = root.querySelectorAll<HTMLAnchorElement>(
      'a[href="/user-profile"]'
    );
    loginLinks.forEach((a) => {
      a.style.display = isLoggedIn ? "none" : "";
    });
    accountLinks.forEach((a) => {
      a.style.display = isLoggedIn ? "" : "none";
    });
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // The DevLink component can reset links back to their Webflow defaults.
    // We need to rewrite them on initial mount and whenever the component updates itself.
    rewriteLinks(el);
    applyAuthVisibility(el, !!sessionRef.current);

    const mo = new MutationObserver(() => {
      // Temporarily disconnect the observer to prevent an infinite loop from our own changes.
      mo.disconnect();
      rewriteLinks(el);
      applyAuthVisibility(el, !!sessionRef.current);
      // Reconnect the observer to watch for future changes from the DevLink component.
      mo.observe(el, { subtree: true, childList: true, attributes: true });
    });
    mo.observe(el, { subtree: true, childList: true, attributes: true });

    // Intercept clicks to ensure client-side nav under basePath
    function onClick(e: Event) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const a = t.closest("a") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      // Allow default browser navigation for external login/account/about pages
      if (
        href === "/log-in" ||
        href === "/user-profile" ||
        href === "/about" ||
        href === "/"
      )
        return;

      if (!href.startsWith("http") && !href.startsWith("mailto:")) {
        e.preventDefault();
        // Push relative route; Next will prefix basePath exactly once
        router.push(href);
      }
    }
    el.addEventListener("click", onClick);
    return () => {
      mo.disconnect();
      el.removeEventListener("click", onClick);
    };
  }, [router]);

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      sessionRef.current = session;
      if (ref.current) applyAuthVisibility(ref.current, !!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      sessionRef.current = session;
      if (ref.current) applyAuthVisibility(ref.current, !!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (ref.current) applyAuthVisibility(ref.current, !!session);
  }, [session]);

  const authStateClass = session ? 'is-logged-in' : 'is-logged-out';

  return (
    <div ref={ref} className={authStateClass}>
      <Navbar
        navbarLinkHome="Home"
        navbarLinkDiveSites="Dive Sites"
        navbarLinkAbout="About"
        navbarLinkContact=""
        buttonTextLogIn="Log In"
        buttonTextMyAccount="My Account"
      />
    </div>
  );
}


