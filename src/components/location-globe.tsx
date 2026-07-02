import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";

type GlobeStyle = CSSProperties & {
  "--marker-x": string;
  "--marker-y": string;
};

export function LocationGlobe({ latitude, longitude, label }: { latitude: number; longitude: number; label: string }) {
  const x = Math.max(18, Math.min(82, 50 + longitude / 180 * 32));
  const y = Math.max(16, Math.min(84, 50 - latitude / 90 * 34));
  const style: GlobeStyle = {
    "--marker-x": `${x}%`,
    "--marker-y": `${y}%`,
  };

  return (
    <div className="location-globe-wrap" role="img" aria-label={label}>
      <div className="location-globe" style={style}>
        <div className="globe-atmosphere" />
        <svg className="globe-surface" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <clipPath id="globe-clip"><circle cx="100" cy="100" r="88" /></clipPath>
          </defs>
          <g clipPath="url(#globe-clip)">
            <path className="globe-grid-line" d="M12 100h176M100 12v176M28 55h144M28 145h144" />
            <ellipse className="globe-grid-line" cx="100" cy="100" rx="46" ry="88" />
            <ellipse className="globe-grid-line" cx="100" cy="100" rx="72" ry="88" />
            <path className="globe-land globe-land-a" d="M30 57l20-18 27 6 9 18-12 14 7 15-17 11-9 28-16-9-4-25-13-16z" />
            <path className="globe-land globe-land-b" d="M108 39l28-9 33 22-5 20 15 15-17 15-10 35-26 22-15-14 5-27-17-19 15-17-13-17z" />
            <path className="globe-land globe-land-c" d="M63 133l18 5 8 20-13 20-14-17z" />
          </g>
          <circle className="globe-rim" cx="100" cy="100" r="88" />
        </svg>
        <span className="globe-marker" aria-hidden="true"><MapPin className="size-3" /></span>
      </div>
      <span className="mt-2 max-w-32 truncate text-center text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
