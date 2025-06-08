import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const App = () => {
  const [pokemon, setPokemon] = useState("");
  const [pokemonData, setPokemonData] = useState([]);
  const [pokemonType, setPokemonType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (pokemon.length > 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [pokemon]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=151`);
      const filtered = response.data.results.filter(p => 
        p.name.toLowerCase().includes(pokemon.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } catch (e) {
      console.log(e);
    }
  };

  const handleChange = (e) => {
    setPokemon(e.target.value.toLowerCase());
    setShowSuggestions(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getPokemon();
  };

  const handleSuggestionClick = (name) => {
    setPokemon(name);
    setShowSuggestions(false);
    getPokemon(name);
  };

  const getPokemon = async (name = pokemon) => {
    setLoading(true);
    setError("");
    const toArray = [];
    try {
      const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
      const res = await axios.get(url);
      toArray.push(res.data);
      setPokemonType(res.data.types[0].type.name);
      setPokemonData(toArray);
    } catch (e) {
      setError("Pokemon not found! Try another name.");
      setPokemonData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>PokéSearch</h1>
      <form onSubmit={handleSubmit}>
        <div className="search-container">
          <input
            type="text"
            value={pokemon}
            onChange={handleChange}
            placeholder="Search for a Pokémon..."
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.name}
                  onClick={() => handleSuggestionClick(suggestion.name)}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {pokemonData.map((data) => (
        <div key={data.id} className="container">
          <div className="pokemon-header">
            <h2>{data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
            <span className="pokemon-id">#{data.id.toString().padStart(3, '0')}</span>
          </div>
          
          <div className="pokemon-image">
            <img 
              src={data.sprites["front_default"]} 
              alt={data.name}
              onMouseOver={e => e.target.src = data.sprites["back_default"]}
              onMouseOut={e => e.target.src = data.sprites["front_default"]}
            />
          </div>

          <div className="types">
            {data.types.map((type, index) => (
              <span key={index} className={`type ${type.type.name}`}>
                {type.type.name}
              </span>
            ))}
          </div>

          <div className="divTable">
            <div className="divTableBody">
              <div className="divTableRow">
                <div className="divTableCell">Height</div>
                <div className="divTableCell">{Math.round(data.height * 3.9)}"</div>
              </div>
              <div className="divTableRow">
                <div className="divTableCell">Weight</div>
                <div className="divTableCell">{Math.round(data.weight / 4.3)} lbs</div>
              </div>
              <div className="divTableRow">
                <div className="divTableCell">Base Experience</div>
                <div className="divTableCell">{data.base_experience}</div>
              </div>
              <div className="divTableRow">
                <div className="divTableCell">Abilities</div>
                <div className="divTableCell">
                  {data.abilities.map(ability => 
                    ability.ability.name.replace('-', ' ')
                  ).join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
