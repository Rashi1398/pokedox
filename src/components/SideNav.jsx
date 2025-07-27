import { useState } from "react";
import { first151Pokemon, getFullPokedexNumber } from "../utlis";

export default function SideNav(props) {
  const {
    selectedPokemon,
    setSelectedPokemon,
    showSideMenu,
    handleCloseMenu,
    handleToggleMenu,
  } = props;
  const [searchValue, setSearchValue] = useState("");

  const filteredPokemon = first151Pokemon.filter((ele, eleIndex) => {
    // if the full pokedex number includes the current Seach value,
    if (getFullPokedexNumber(eleIndex).toString().includes(searchValue)) {
      return true;
    }
    // if the pokemon name includes the curent seach value
    if (ele.toLowerCase().includes(searchValue?.toLowerCase())) {
      return true;
    }
    return false;
  });

  return (
    <nav className={" " + (!showSideMenu ? "open" : "")}>
      <div className={"header " + (!showSideMenu ? "open" : "")}>
        <button
          type="button"
          className="open-nav-button"
          onClick={handleToggleMenu}
        >
          <i className="fa-solid fa-arrow-left-long"></i>
        </button>
        <h1 className="text-gradient">Pokedëx</h1>
      </div>
      <input
        placeholder="Eg. 001 or Bulba..."
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
      />
      {filteredPokemon.map((pokemon, pokemonIndex) => {
        const originalPokemonIndex = first151Pokemon.indexOf(pokemon);

        return (
          <button
            type="button"
            key={pokemonIndex}
            className={
              "nav-card " +
              (selectedPokemon === pokemonIndex ? "nav-card-selected" : "")
            }
            onClick={() => {
              setSelectedPokemon(originalPokemonIndex);
              handleCloseMenu();
            }}
          >
            <p> {getFullPokedexNumber(originalPokemonIndex)}</p>
            <p> {pokemon} </p>
          </button>
        );
      })}
    </nav>
  );
}
