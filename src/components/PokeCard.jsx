import { useEffect, useState } from "react";
import { getFullPokedexNumber, getPokedexNumber } from "../utlis/index.js";
import TypeCard from "./TypeCard.jsx";
import Modal from "./Modal.jsx";

export default function PokeCard(props) {
  //selectedPokemon is the poekdexNumber
  const { selectedPokemon } = props;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [skill, setSkill] = useState(null);

  const [loadingSkill, setLoadingSkill] = useState(false);

  const cacheKey = "pokedex";
  const skillsCacheKey = "pokemon-moves";

  const { name, height, abilities, stats, types, moves, sprites } = data || {};
  // purely pokemon logic for image extraction
  const imgList = Object.keys(sprites || {}).filter((val) => {
    if (!sprites[val]) {
      return false;
    }
    if (["versions", "other"].includes(val)) {
      return false;
    }
    return true;
  });

  // fetch move Data
  async function fetchMoveData(move, moveUrl) {
    if (loadingSkill || !localStorage || !moveUrl) {
      return;
    }

    // check cache for move

    let c = {};

    if (localStorage.getItem(skillsCacheKey)) {
      c = JSON.parse(localStorage.getItem(skillsCacheKey));
    }

    if (move in c) {
      setSkill(c[move]);
      console.log("Skill Cache hit");
      return;
    }

    try {
      setLoadingSkill(true);
      const res = await fetch(moveUrl);
      const moveData = await res.json();
      console.log("Fetched Move Data! for :: " + move);
      // Some Pokemon logic

      const description = moveData?.flavor_text_entries.filter((val) => {
        return val.version_group.name === "firered-leafgreen";
      });

      const skillData = {
        name: move,
        description: description[0]?.flavor_text,
      };

      setSkill(skillData);
      c[move] = skillData;
      localStorage.setItem(skillsCacheKey, JSON.stringify(c));
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoadingSkill(false);
    }
  }

  useEffect(() => {
    // if loading, exit logic
    if (loading || !localStorage) {
      return;
    }
    // check if the selected pokemon information is available in the cache
    // 1. define cache

    let cache = {};
    if (localStorage.getItem(cacheKey)) {
      cache = JSON.parse(localStorage.getItem(cacheKey));
    }

    // 2. check if the selected pokemon is in the cache, otherwise fetch from the API

    if (selectedPokemon in cache) {
      // read from cache
      setData(cache[selectedPokemon]);
      return;
    }

    async function fetchPokemonData() {
      setLoading(true);
      try {
        const baseUrl = "https://pokeapi.co/api/v2/";
        const suffix = `pokemon/` + getPokedexNumber(selectedPokemon);

        const finalUrl = baseUrl + suffix;
        const res = await fetch(finalUrl);

        const pokemonData = await res.json();
        setData(pokemonData);

        cache[selectedPokemon] = pokemonData;
        localStorage.setItem(cacheKey, JSON.stringify(cache));
      } catch (e) {
        console.log(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemonData();
    // if we fetch from the api, make sure to save th information to the cache for next time
  }, [selectedPokemon]);

  if (loading || !data) {
    return (
      <div>
        <h4>Loading ...</h4>
      </div>
    );
  }

  return (
    <div className="poke-card">
      {/* Conditional Rendereing*/}
      {skill && (
        <Modal
          handleCloseModal={() => {
            setSkill(null);
          }}
        >
          <div>
            <h6>Name</h6>
            <h2 className="skill-name">{skill.name.replaceAll("-", " ")}</h2>
          </div>
          <div>
            <h6>Description</h6>
            <p>{skill.description}</p>
          </div>
        </Modal>
      )}
      <div>
        <h4>{getFullPokedexNumber(selectedPokemon)}</h4>
        <h2>{name}</h2>
      </div>
      <div className="type-container">
        {types.map((typeObj, typeIndex) => {
          return <TypeCard key={typeIndex} type={typeObj?.type?.name} />;
        })}
      </div>
      <img
        className="default-img"
        src={`/pokemon/${getFullPokedexNumber(selectedPokemon)}.png`}
        alt={`${name}-large-img`}
      />
      {/* Sprite image */}
      <div className="img-container">
        {imgList.map((sprite, spriteIndex) => {
          const imgUrl = sprites[sprite];
          return (
            <img key={spriteIndex} src={imgUrl} alt={`${name}-img-${sprite}`} />
          );
        })}
      </div>
      {/* Stats of the pokemon */}
      <h3>Stats</h3>
      <div className="stats-card">
        {stats.map((statObj, statIndex) => {
          const { stat, base_stat } = statObj;
          return (
            <div key={statIndex} className="stat-item">
              <p>{stat?.name?.replace("-", " ")}</p> <h4>{base_stat}</h4>
            </div>
          );
        })}
      </div>

      {/* Moves of the pokemon */}
      <h3>Moves</h3>
      <div className="pokemon-move-grid">
        {moves.map((moveObj, moveIndex) => {
          return (
            <button
              type="button"
              className="button-card pokemon-move"
              key={moveIndex}
              onClick={() => {
                fetchMoveData(moveObj?.move?.name, moveObj?.move?.url);
              }}
            >
              <p>{moveObj?.move?.name.replaceAll("-", " ")}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
