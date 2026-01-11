// src/components/geo/CountrySelector.tsx
import { allCountries } from "../../data/countries";
import { SearchableSelect } from "../common/SearchableSelect";

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export function CountrySelector({ value, onChange }: Props) {
  const options = allCountries.map(c => ({ id: c.id, name: c.name }));

  return (
    <section>
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        label="Select Country"
        placeholder="Search countries..."
      />
    </section>
  );
}
