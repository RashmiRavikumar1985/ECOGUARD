// src/components/geo/RegionSelector.tsx
import { type Region } from "../../types/geo";
import { RadioList } from "../common/RadioList";

type Props = {
  regions: Region[];
  value: string | null;
  onChange: (id: string) => void;
};

export function RegionSelector({
  regions,
  value,
  onChange,
}: Props) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-[#92adc9] uppercase tracking-wide">
        Select Region
      </h3>

      {regions.length === 0 ? (
        <p className="text-xs text-[#92adc9] italic">
          This country has no regions available
        </p>
      ) : (
        <RadioList
          items={regions}
          value={value}
          onChange={onChange}
          name="region"
          getId={(r) => r.id}
          getLabel={(r) => r.name}
        />
      )}
    </section>
  );
}
