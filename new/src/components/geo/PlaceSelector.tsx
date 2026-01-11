// src/components/geo/PlaceSelector.tsx
import { type Place } from "../../types/geo";
import { RadioList } from "../common/RadioList";

type Props = {
  places: Place[];
  value: string | null;
  onChange: (id: string) => void;
};

export function PlaceSelector({
  places,
  value,
  onChange,
}: Props) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-[#92adc9] uppercase tracking-wide">
        Select Place
      </h3>

      {places.length === 0 ? (
        <p className="text-xs text-[#92adc9] italic">
          Select a region first
        </p>
      ) : (
        <RadioList
          items={places}
          value={value}
          onChange={onChange}
          name="place"
          getId={(p) => p.id}
          getLabel={(p) => p.name}
        />
      )}
    </section>
  );
}
