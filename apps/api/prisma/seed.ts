import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.movieRating.deleteMany();
  await prisma.movieActor.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.actor.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const hashedPassword = await bcrypt.hash('AdminPassword123!', 12);
  const testPassword = await bcrypt.hash('TestPassword123!', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@asmovie.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'test@asmovie.com',
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: testPassword,
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      },
    }),
  ]);

  // Create actors
  const actors = await Promise.all([
    prisma.actor.create({
      data: {
        name: 'Leonardo DiCaprio',
        birthDate: new Date('1974-11-11'),
        biography:
          'American actor and film producer known for his work in biographical and period films.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Marion Cotillard',
        birthDate: new Date('1975-09-30'),
        biography: 'French actress, singer, and environmentalist.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Tom Hardy',
        birthDate: new Date('1977-09-15'),
        biography: 'English actor and producer known for his versatile roles.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Cillian Murphy',
        birthDate: new Date('1976-05-25'),
        biography:
          'Irish actor known for his work in both independent and blockbuster films.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Morgan Freeman',
        birthDate: new Date('1937-06-01'),
        biography:
          'American actor, director, and narrator known for his distinctive voice.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Tim Robbins',
        birthDate: new Date('1958-10-16'),
        biography: 'American actor, director, and musician.',
      },
    }),
  ]);

  // Create movies
  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        title: 'Inception',
        description:
          'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        releaseYear: 2010,
        genre: 'Sci-Fi',
        duration: 148,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Dark Knight Rises',
        description:
          "Eight years after the Joker's reign of anarchy, Batman, with the help of the enigmatic Catwoman, is forced from his exile to save Gotham City from the brutal guerrilla terrorist Bane.",
        releaseYear: 2012,
        genre: 'Action',
        duration: 165,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Shawshank Redemption',
        description:
          'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        releaseYear: 1994,
        genre: 'Drama',
        duration: 142,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Dunkirk',
        description:
          'Allied soldiers from Belgium, the British Commonwealth and Empire, and France are surrounded by the German Army and evacuated during a fierce battle in World War II.',
        releaseYear: 2017,
        genre: 'War',
        duration: 106,
      },
    }),
  ]);

  // Create movie-actor relationships
  await Promise.all([
    // Inception cast
    prisma.movieActor.create({
      data: {
        movieId: movies[0].id,
        actorId: actors[0].id, // Leonardo DiCaprio
        role: 'Dom Cobb',
      },
    }),
    prisma.movieActor.create({
      data: {
        movieId: movies[0].id,
        actorId: actors[1].id, // Marion Cotillard
        role: 'Mal',
      },
    }),
    prisma.movieActor.create({
      data: {
        movieId: movies[0].id,
        actorId: actors[2].id, // Tom Hardy
        role: 'Eames',
      },
    }),
    prisma.movieActor.create({
      data: {
        movieId: movies[0].id,
        actorId: actors[3].id, // Cillian Murphy
        role: 'Robert Fischer',
      },
    }),

    // The Dark Knight Rises cast
    prisma.movieActor.create({
      data: {
        movieId: movies[1].id,
        actorId: actors[2].id, // Tom Hardy
        role: 'Bane',
      },
    }),

    // The Shawshank Redemption cast
    prisma.movieActor.create({
      data: {
        movieId: movies[2].id,
        actorId: actors[4].id, // Morgan Freeman
        role: 'Ellis Boyd "Red" Redding',
      },
    }),
    prisma.movieActor.create({
      data: {
        movieId: movies[2].id,
        actorId: actors[5].id, // Tim Robbins
        role: 'Andy Dufresne',
      },
    }),

    // Dunkirk cast
    prisma.movieActor.create({
      data: {
        movieId: movies[3].id,
        actorId: actors[2].id, // Tom Hardy
        role: 'Farrier',
      },
    }),
    prisma.movieActor.create({
      data: {
        movieId: movies[3].id,
        actorId: actors[3].id, // Cillian Murphy
        role: 'Shivering Soldier',
      },
    }),
  ]);

  // Create movie ratings
  await Promise.all([
    // Inception ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[0].id,
        rating: 9.2,
        comment: 'Mind-bending masterpiece!',
        reviewer: 'Film Critic A',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[0].id,
        rating: 8.8,
        comment: 'Complex but rewarding',
        reviewer: 'Movie Fan',
      },
    }),

    // The Dark Knight Rises ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[1].id,
        rating: 8.4,
        comment: 'Epic conclusion to the trilogy',
        reviewer: 'Batman Fan',
      },
    }),

    // The Shawshank Redemption ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[2].id,
        rating: 9.3,
        comment: 'One of the greatest films ever made',
        reviewer: 'Classic Film Lover',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[2].id,
        rating: 9.5,
        comment: 'Absolutely perfect storytelling',
        reviewer: 'Cinema Professor',
      },
    }),

    // Dunkirk ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[3].id,
        rating: 8.6,
        comment: 'Intense and immersive war film',
        reviewer: 'War Film Enthusiast',
      },
    }),
  ]);

  // Agregar actores y películas para integración
  const testActors = await Promise.all([
    prisma.actor.create({
      data: {
        name: 'Test Actor',
        birthDate: new Date('1990-01-01'),
        biography: 'Biography for Test Actor',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Test Actor 1',
        birthDate: new Date('1991-01-01'),
        biography: 'Biography for Test Actor 1',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'John Doe',
        birthDate: new Date('1980-01-01'),
        biography: 'Biography for John Doe',
      },
    }),
  ]);

  const testMovies = await Promise.all([
    prisma.movie.create({
      data: {
        title: 'Test Movie',
        description: 'Description for Test Movie',
        releaseYear: 2020,
        genre: 'Drama',
        duration: 120,
      },
    }),
  ]);

  // Relacionar actor y película de test
  await prisma.movieActor.create({
    data: {
      movieId: testMovies[0].id,
      actorId: testActors[0].id,
      role: 'Main Role',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👥 Created ${users.length} users`);
  console.log(`📽️  Created ${movies.length} movies`);
  console.log(`🎭 Created ${actors.length} actors`);
  console.log(`⭐ Created multiple ratings`);
  console.log('');
  console.log('🔐 Test users created:');
  console.log('  📧 admin@asmovie.com - Password: AdminPassword123!');
  console.log('  📧 test@asmovie.com - Password: TestPassword123!');
  console.log('  📧 john.doe@example.com - Password: TestPassword123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
