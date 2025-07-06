#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixActorsIntegrationTests() {
  console.log('🔧 Fixing actors integration tests...');

  const filePath = path.join(
    __dirname,
    'src/actors/actors.integration.spec.ts',
  );
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the data setup issues - ensure tests create proper data in the right order
  const setupFix = `
  beforeEach(async () => {
    // Clean up database before each test - proper order to avoid foreign key constraints
    await prismaService.movieRating.deleteMany();
    await prismaService.movieActor.deleteMany();
    await prismaService.movie.deleteMany();
    await prismaService.actor.deleteMany();
  });`;

  // Replace existing beforeEach
  content = content.replace(
    /beforeEach\(async \(\) => \{[\s\S]*?\}\);/,
    setupFix,
  );

  // Fix test data creation issues - make sure movies are created properly
  content = content.replace(
    /\/\/ Create test actors[\s\S]*?await prismaService\.actor\.createMany\(\{[\s\S]*?\}\);/,
    `// Create test actors
      await prismaService.actor.createMany({
        data: [
          {
            name: 'Test Actor 1',
            biography: 'Test biography 1',
            birthDate: new Date('1990-01-01'),
          },
          {
            name: 'John Doe',
            biography: 'Test biography 2', 
            birthDate: new Date('1985-05-15'),
          },
        ],
      });`,
  );

  // Fix movie creation in getMovies test
  content = content.replace(
    /\/\/ Create movie and actor[\s\S]*?await prismaService\.movieActor\.create\(\{[\s\S]*?\}\);/,
    `// Create movie and actor
      const movie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });

      const actor = await prismaService.actor.create({
        data: {
          name: 'Test Actor in Test Movie',
          biography: 'Test biography',
          birthDate: new Date('1990-01-01'),
        },
      });

      // Link actor to movie
      await prismaService.movieActor.create({
        data: {
          movieId: movie.id,
          actorId: actor.id,
          role: 'Lead Actor',
        },
      });`,
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed actors integration tests');
}

function fixMovieRatingsIntegrationTests() {
  console.log('🔧 Fixing movie-ratings integration tests...');

  const filePath = path.join(
    __dirname,
    'src/movie-ratings/movie-ratings.integration.spec.ts',
  );
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the beforeEach setup
  const setupFix = `
  beforeEach(async () => {
    // Clean up database before each test - proper order to avoid foreign key constraints
    await prismaService.movieRating.deleteMany();
    await prismaService.movieActor.deleteMany();
    await prismaService.movie.deleteMany();
    await prismaService.actor.deleteMany();
  });`;

  content = content.replace(
    /beforeEach\(async \(\) => \{[\s\S]*?\}\);/,
    setupFix,
  );

  // Fix movie creation patterns to ensure movies exist before creating ratings
  content = content.replace(
    /\/\/ Create a movie rating[\s\S]*?await prismaService\.movieRating\.create\(\{[\s\S]*?\}\);/g,
    `// Create movie first
      const movie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });

      // Create a movie rating
      await prismaService.movieRating.create({
        data: {
          movieId: movie.id,
          rating: 8.5,
          reviewer: 'Test Reviewer',
          comment: 'Great movie!',
        },
      });`,
  );

  // Fix createMany patterns
  content = content.replace(
    /\/\/ Create movies[\s\S]*?await prismaService\.movieRating\.createMany\(\{[\s\S]*?\}\);/g,
    `// Create movies first
      const movie1 = await prismaService.movie.create({
        data: {
          title: 'Test Movie 1',
          description: 'Test description 1',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });

      const movie2 = await prismaService.movie.create({
        data: {
          title: 'Test Movie 2',
          description: 'Test description 2',
          releaseYear: 2022,
          genre: 'Drama',
          duration: 135,
        },
      });

      await prismaService.movieRating.createMany({
        data: [
          {
            movieId: movie1.id,
            rating: 8.5,
            reviewer: 'Test Reviewer 1',
            comment: 'Great movie!',
          },
          {
            movieId: movie2.id,
            rating: 7.0,
            reviewer: 'Test Reviewer 2',
            comment: 'Good movie!',
          },
        ],
      });`,
  );

  fs.writeFileSync(filePath, 'utf8');
  console.log('✅ Fixed movie-ratings integration tests');
}

function fixMoviesIntegrationTests() {
  console.log('🔧 Fixing movies integration tests...');

  const filePath = path.join(
    __dirname,
    'src/movies/movies.integration.spec.ts',
  );
  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure better test isolation by fixing beforeEach in the "GET /movies" describe block
  content = content.replace(
    /describe\('GET \/movies', \(\) => \{[\s\S]*?beforeEach\(async \(\) => \{[\s\S]*?\}\);/,
    `describe('GET /movies', () => {
    beforeEach(async () => {
      // Create test data
      const movies = [
        {
          title: 'Action Movie 1',
          description: 'First action movie',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
        {
          title: 'Drama Movie 1',
          description: 'First drama movie',
          releaseYear: 2022,
          genre: 'Drama',
          duration: 135,
        },
        {
          title: 'Action Movie 2',
          description: 'Second action movie',
          releaseYear: 2023,
          genre: 'Action',
          duration: 110,
        },
        {
          title: 'Sci-Fi Movie 1',
          description: 'A movie about space adventures',
          releaseYear: 2023,
          genre: 'Sci-Fi',
          duration: 140,
        },
        {
          title: 'Comedy Movie 1',
          description: 'A funny movie',
          releaseYear: 2021,
          genre: 'Comedy',
          duration: 95,
        },
      ];

      await prismaService.movie.createMany({ data: movies });
    });`,
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed movies integration tests');
}

function main() {
  console.log('🚀 Starting integration tests fix...');

  try {
    fixActorsIntegrationTests();
    fixMovieRatingsIntegrationTests();
    fixMoviesIntegrationTests();

    console.log('🎉 All integration tests have been fixed!');
    console.log('📝 Summary of fixes:');
    console.log(
      '   - Fixed database cleanup order to prevent foreign key constraint violations',
    );
    console.log('   - Fixed test data setup in actors tests');
    console.log(
      '   - Fixed movie creation before rating creation in movie-ratings tests',
    );
    console.log(
      '   - Fixed movie test data setup for proper pagination and filtering tests',
    );
    console.log('');
    console.log(
      '💡 Run tests with: npm test -- --testPathPattern=integration.spec.ts',
    );
  } catch (error) {
    console.error('❌ Error fixing integration tests:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  fixActorsIntegrationTests,
  fixMovieRatingsIntegrationTests,
  fixMoviesIntegrationTests,
};
