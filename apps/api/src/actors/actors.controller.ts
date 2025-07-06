import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ActorsService } from './actors.service';
import { CreateActorDto, UpdateActorDto } from './dto/actor.dto';
import { ApiOrJwtGuard } from '../common/guards/api-or-jwt.guard';

@Controller('actors')
@UsePipes(new ValidationPipe({ transform: true }))
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Post()
  @UseGuards(ApiOrJwtGuard)
  create(@Body() createActorDto: CreateActorDto) {
    return this.actorsService.create(createActorDto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.actorsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.actorsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ApiOrJwtGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActorDto: UpdateActorDto,
  ) {
    return this.actorsService.update(id, updateActorDto);
  }

  @Delete(':id')
  @UseGuards(ApiOrJwtGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.actorsService.remove(id);
  }

  @Get(':id/movies')
  getMovies(@Param('id', ParseIntPipe) id: number) {
    return this.actorsService.getMovies(id);
  }
}
