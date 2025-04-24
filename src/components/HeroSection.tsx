import { useTheme } from "next-themes";
import { useEffect, useRef, Fragment } from "react";
import { m } from "framer-motion";
import { Link } from "react-router-dom";

const HERO_H = "70vh";
const NAV_H  = "4rem";

export default function HeroSection() {
  const { theme, resolvedTheme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  /* swap the video on theme change */
  useEffect(() => {
    if (!videoRef.current) return;
    const mode = theme === "system" ? resolvedTheme : theme;
    const file = mode === "dark" ? "/night-hero-bg.mp4" : "/day-hero-bg.mp4";
    if (!videoRef.current.currentSrc.endsWith(file)) {
      videoRef.current.src = file;
      void videoRef.current.play();
    }
  }, [theme, resolvedTheme]);

  return (
    <Fragment>
      <div style={{ height: `calc(${HERO_H})` }} />

      <section
        className="absolute left-0 w-full"
        style={{ top: NAV_H, height: HERO_H }}
      >
        {/* video */}
        <video
          ref={videoRef}
          src="/day-hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />

        <div
          aria-hidden
          className="
            absolute inset-0
            bg-gradient-to-b
            from-background/0
            via-background/30
            to-background/100
          "
        />

        {/* CTA */}
        <m.div
          transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.3 }}
          className="absolute w-full flex h-full flex-col items-center justify-center text-center"
        >
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white drop-shadow md:text-6xl">
            Discover&nbsp;&amp;&nbsp;Review&nbsp;Games
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-lg font-medium text-white/90">
            Join the community — add your favourites or leave the first review!
          </p>

          <Link
            to="/add-game"
            className="
                inline-block
                rounded-lg
                bg-[hsl(43.6,100%,69.8%)]
                px-8 py-3
                text-lg font-semibold
                text-black
                transition-colors duration-200
                hover:bg-[hsl(43.6,100%,60%)]
            "
            >
            Add&nbsp;a&nbsp;Game
            </Link>
        </m.div>
      </section>
    </Fragment>
  );
}   
