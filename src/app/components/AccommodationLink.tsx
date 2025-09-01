'use client';

type Props = {
  name: string;
  country?: string;
  lat: number;
  lng: number;
};

export default function AccommodationLink({ name, country, lat, lng }: Props) {
  const query = [name, country].filter(Boolean).join(' ');
  const hotelsHref = `https://www.google.com/travel/hotels?q=${encodeURIComponent(`hotels near ${query || `${lat},${lng}`}`)}`;
  return (
    <a className="dg-btn" href={hotelsHref} target="_blank" rel="noopener noreferrer">Find places to stay</a>
  );
}


