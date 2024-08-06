import { Injectable } from '@nestjs/common';
import { NamedAPIResource, PokemonClient } from 'pokenode-ts';
import { PAGE_SIZE } from './pokemon.constants';


@Injectable()
export class PokemonService {
    protected PokedexAPI = new PokemonClient();
    protected allPokemon: NamedAPIResource[] = []; // stores all pokemon name, in prod, this would be copied into a DB periodically
    constructor() {
        this.fetchAllPokemons();
    }
    // API can only find exact name matches
    // gets all pokemon to be able to find unexact match for names
    private async fetchAllPokemons() {
        try {
            let offset = 0;
            const limit = PAGE_SIZE;
    
            let isFetchingData = true;
    
            while (isFetchingData) {
                const response = await this.PokedexAPI.listPokemons(offset, limit);
                const { results, next } = response;
    
                this.allPokemon = this.allPokemon.concat(results);
    
                if (!next) {
                    isFetchingData = false;
                }
    
                offset += limit;
            }
        }
        catch(err) {
            console.error('Error in fetchAllPokemons: ', err);
        }
    }
    async findPokemonByName(name: string) {
        try {
            //find pokemon in stored list, then fetch API with found pokemon name
            const lowerCaseName = name.toLowerCase();
            const matchingPokemon = this.allPokemon
                .filter(item => item.name.toLowerCase().includes(lowerCaseName))
                .map(item => item.name);

            // no matches similar matches, try to look for exact match in API
            const promises = matchingPokemon.length ? 
            matchingPokemon.map(name => this.PokedexAPI.getPokemonByName(name)) : [this.PokedexAPI.getPokemonByName(name)]
            const foundPokemon = await Promise.all(promises);
            const parsedPokemonResults = foundPokemon.map((poke)=> {
                const data = {
                    name: poke.name,
                    types: poke.types.map((type)=> type.type.name),
                    image: poke.sprites.front_default
                };
                return data;
            })
            return parsedPokemonResults;
        }
        catch (err) {
            console.error('Error in findPokemonByName: ', err);
            return {};
        }
    }
}
