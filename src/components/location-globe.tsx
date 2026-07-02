import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";

type GlobeStyle = CSSProperties & {
  "--marker-x": string;
  "--marker-y": string;
};

export function LocationGlobe({ latitude, longitude, label }: { latitude: number; longitude: number; label: string }) {
  const x = 10 + (longitude + 180) / 360 * 80;
  const y = 10 + (90 - latitude) / 180 * 80;
  const style: GlobeStyle = {
    "--marker-x": `${Math.max(10, Math.min(90, x))}%`,
    "--marker-y": `${Math.max(10, Math.min(90, y))}%`,
  };

  return (
    <div className="location-globe-wrap" role="img" aria-label={label}>
      <div className="location-globe" style={style}>
        <div className="globe-map" />
        <div className="globe-atmosphere" />
        <svg className="globe-surface" viewBox="0 0 200 200" aria-hidden="true">
          <path className="globe-grid-line" d="M12 100h176M100 12v176M28 55h144M28 145h144" />
          <ellipse className="globe-grid-line" cx="100" cy="100" rx="46" ry="88" />
          <ellipse className="globe-grid-line" cx="100" cy="100" rx="72" ry="88" />
          <circle className="globe-rim" cx="100" cy="100" r="88" />
        </svg>
        <span className="globe-marker" aria-hidden="true"><MapPin className="size-3" /></span>
      </div>
      <span className="mt-2 max-w-32 truncate text-center text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
