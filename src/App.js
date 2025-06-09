import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import axios from "axios";

const App = () => {
  const [pokemon, setPokemon] = useState("");
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [flavorText, setFlavorText] = useState("");
  const [baseStats, setBaseStats] = useState([]);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [showShiny, setShowShiny] = useState(false);
  const [typeRelations, setTypeRelations] = useState({ weak: [], resist: [], immune: [] });
  const [moveList, setMoveList] = useState([]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=151`);
      const filtered = response.data.results.filter(p => 
        p.name.toLowerCase().includes(pokemon.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } catch (e) {
      console.log(e);
    }
  }, [pokemon]);

  useEffect(() => {
    if (pokemon.length > 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [pokemon, fetchSuggestions]);

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
    setFlavorText("");
    setBaseStats([]);
    setEvolutionChain([]);
    setShowShiny(false);
    setTypeRelations({ weak: [], resist: [], immune: [] });
    setMoveList([]);
    const toArray = [];
    try {
      // Fetch main Pokémon data
      const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
      const res = await axios.get(url);
      toArray.push(res.data);
      setPokemonData(toArray);
      setBaseStats(res.data.stats);

      // Fetch species data for flavor text and evolution chain
      const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${res.data.id}`;
      const speciesRes = await axios.get(speciesUrl);
      // Get English flavor text
      const flavor = speciesRes.data.flavor_text_entries.find(
        entry => entry.language.name === "en"
      );
      setFlavorText(flavor ? flavor.flavor_text.replace(/\f/g, ' ') : "");

      // Fetch evolution chain
      const evoUrl = speciesRes.data.evolution_chain.url;
      const evoRes = await axios.get(evoUrl);
      const evoChain = [];
      let evoData = evoRes.data.chain;
      do {
        evoChain.push({
          name: evoData.species.name,
        });
        evoData = evoData.evolves_to[0];
      } while (evoData && evoData.hasOwnProperty('evolves_to'));
      // Fetch sprites for each evolution
      const evoChainWithSprites = await Promise.all(
        evoChain.map(async (evo) => {
          try {
            const evoPoke = await axios.get(`https://pokeapi.co/api/v2/pokemon/${evo.name}`);
            return {
              name: evo.name,
              sprite: evoPoke.data.sprites.front_default,
            };
          } catch {
            return { name: evo.name, sprite: null };
          }
        })
      );
      setEvolutionChain(evoChainWithSprites);

      // Type weaknesses/resistances
      const typeUrls = res.data.types.map(t => t.type.url);
      const typeData = await Promise.all(typeUrls.map(url => axios.get(url)));
      // Collect all relations
      let doubleDamageFrom = [];
      let halfDamageFrom = [];
      let noDamageFrom = [];
      typeData.forEach(td => {
        doubleDamageFrom = doubleDamageFrom.concat(td.data.damage_relations.double_damage_from.map(t => t.name));
        halfDamageFrom = halfDamageFrom.concat(td.data.damage_relations.half_damage_from.map(t => t.name));
        noDamageFrom = noDamageFrom.concat(td.data.damage_relations.no_damage_from.map(t => t.name));
      });
      // Remove duplicates and handle overlaps
      let weak = doubleDamageFrom.filter(t => !noDamageFrom.includes(t));
      let resist = halfDamageFrom.filter(t => !noDamageFrom.includes(t) && !doubleDamageFrom.includes(t));
      let immune = [...new Set(noDamageFrom)];
      weak = [...new Set(weak)];
      resist = [...new Set(resist)];
      setTypeRelations({ weak, resist, immune });

      // Move list: first 5 level-up moves
      const levelUpMoves = res.data.moves
        .filter(m => m.version_group_details.some(vgd => vgd.move_learn_method.name === "level-up"))
        .map(m => {
          const vgd = m.version_group_details.find(vgd => vgd.move_learn_method.name === "level-up");
          return {
            name: m.move.name,
            level: vgd ? vgd.level_learned_at : 0
          };
        })
        .sort((a, b) => a.level - b.level)
        .slice(0, 5);
      setMoveList(levelUpMoves);
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
              src={showShiny ? data.sprites["front_shiny"] : data.sprites["front_default"]} 
              alt={data.name}
              onMouseOver={e => e.target.src = showShiny ? data.sprites["back_shiny"] : data.sprites["back_default"]}
              onMouseOut={e => e.target.src = showShiny ? data.sprites["front_shiny"] : data.sprites["front_default"]}
            />
            <button className="shiny-toggle" onClick={() => setShowShiny(s => !s)}>
              {showShiny ? "Show Normal" : "Show Shiny"}
            </button>
          </div>
          <div className="types">
            {data.types.map((type, index) => (
              <span key={index} className={`type ${type.type.name}`}>
                {type.type.name}
              </span>
            ))}
          </div>

          {/* Type Weaknesses/Resistances */}
          <div className="type-relations">
            <h3>Type Matchups</h3>
            <div className="type-relations-list">
              <span><strong>Weak to:</strong> {typeRelations.weak.length ? typeRelations.weak.join(", ") : "None"}</span><br/>
              <span><strong>Resistant to:</strong> {typeRelations.resist.length ? typeRelations.resist.join(", ") : "None"}</span><br/>
              <span><strong>Immune to:</strong> {typeRelations.immune.length ? typeRelations.immune.join(", ") : "None"}</span>
            </div>
          </div>

          {/* Pokédex Entry */}
          {flavorText && (
            <div className="flavor-text">
              <em>{flavorText}</em>
            </div>
          )}

          {/* Base Stats */}
          {baseStats.length > 0 && (
            <div className="base-stats">
              <h3>Base Stats</h3>
              <table className="stats-table">
                <tbody>
                  {baseStats.map((stat, idx) => (
                    <tr key={idx}>
                      <td>{stat.stat.name.replace('-', ' ').toUpperCase()}</td>
                      <td>
                        <div className="stat-bar-bg">
                          <div className="stat-bar" style={{width: `${stat.base_stat/2}%`}}></div>
                        </div>
                      </td>
                      <td>{stat.base_stat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Evolution Chain */}
          {evolutionChain.length > 0 && (
            <div className="evolution-chain">
              <h3>Evolution Chain</h3>
              <div className="evo-list">
                {evolutionChain.map((evo, idx) => (
                  <span key={evo.name} className="evo-item">
                    {evo.sprite && <img src={evo.sprite} alt={evo.name} className="evo-sprite" />}
                    <span className="evo-name">{evo.name.charAt(0).toUpperCase() + evo.name.slice(1)}</span>
                    {idx < evolutionChain.length - 1 && <span className="evo-arrow">→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Move List */}
          {moveList.length > 0 && (
            <div className="move-list">
              <h3>Notable Moves (Level-up)</h3>
              <ul>
                {moveList.map((move, idx) => (
                  <li key={move.name}>
                    <span className="move-name">{move.name.replace("-", " ")}</span>
                    {move.level > 0 && <span className="move-level"> (Lv. {move.level})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
