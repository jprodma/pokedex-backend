import { Controller, Get, Param } from '@nestjs/common';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
    constructor(private pokemonService:PokemonService){}

    @Get('/:name')
    async findPokemonByName(@Param('name') name:string){
        return this.pokemonService.findPokemonByName(name);
    }
}
