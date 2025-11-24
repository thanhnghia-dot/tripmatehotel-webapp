import React, { useState, useEffect } from 'react';

function AddressAutocomplete({ value, onChange, error }) {
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 2) {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        )
          .then((res) => res.json())
          .then((data) => setSuggestions(data))
          .catch((err) => console.error('Nominatim error:', err));
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (address) => {
    onChange(address);
    setQuery(address);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="autocomplete-wrapper" style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        placeholder="Address *"
        className={error ? 'input-error' : ''}
        required
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((sug) => (
            <div
              key={sug.place_id}
              className="autocomplete-suggestion"
              onClick={() => handleSelect(sug.display_name)}
            >
              {sug.display_name}
            </div>
          ))}
        </div>
      )}
      {error && <small className="error-message">{error}</small>}
    </div>
  );
}

export default AddressAutocomplete;
