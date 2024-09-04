import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import { useEffect } from "react";

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
    }
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    function updateScaleFactor() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const diagonal = Math.sqrt(vw * vw + vh * vh);
      const scaleFactor = diagonal / Math.min(vw, vh);
      document.body.style.setProperty('--scale-factor', `${scaleFactor}`);
    }  
    updateScaleFactor();  
    window.addEventListener('resize', updateScaleFactor);
    return () => {
      window.removeEventListener('resize', updateScaleFactor);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes" />
        <Meta />
        <Links />
      </head>
      <body className="relative overflow-hidden">
        <div className="absolute inset-0 animate-spin-slower" style={{ height: '100vh' }}>
        <div className="w-full h-full bg-[url('/assets/taqui-o-background.png')] bg-center bg-no-repeat bg-cover" style={{ transform: 'scale(var(--scale-factor))' }}></div>
        </div>
        <div className="relative">
          {children}
          <ScrollRestoration />
          <Scripts />
        </div>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
