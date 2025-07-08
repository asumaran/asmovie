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

  // Create comprehensive movie data
  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        plot: 'Dom Cobb is a skilled thief who steals secrets from people\'s subconscious minds while they dream. He is offered a chance to have his criminal record erased in exchange for performing an "inception" - planting an idea deep within someone\'s mind rather than stealing one.',
        releaseYear: 2010,
        genre: 'Sci-Fi',
        duration: 148,
        budget: 160000000,
        boxOffice: 836800000,
        awards: 'Academy Award for Best Cinematography, Best Sound Editing, Best Sound Mixing, Best Visual Effects; BAFTA Awards for Best Production Design, Best Special Visual Effects, Best Sound',
        writers: 'Christopher Nolan',
        director: 'Christopher Nolan',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        plot: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent. Together they take on Gotham\'s organized crime and encounter the Joker, a criminal mastermind who wants to plunge the city into anarchy.',
        releaseYear: 2008,
        genre: 'Action',
        duration: 152,
        budget: 185000000,
        boxOffice: 1004000000,
        awards: 'Academy Award for Best Supporting Actor (Heath Ledger); BAFTA Award for Best Supporting Actor; Golden Globe for Best Supporting Actor',
        writers: 'Jonathan Nolan, Christopher Nolan',
        director: 'Christopher Nolan',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        plot: 'Banker Andy Dufresne is sentenced to life in Shawshank State Penitentiary for the murders of his wife and her lover, despite his claims of innocence. Over the next two decades, he befriends a fellow prisoner, contraband smuggler Ellis "Red" Redding, and becomes instrumental in a money laundering operation.',
        releaseYear: 1994,
        genre: 'Drama',
        duration: 142,
        budget: 25000000,
        boxOffice: 16000000,
        awards: 'Nominated for 7 Academy Awards including Best Picture; AFI\'s 100 Years...100 Movies (10th Anniversary Edition) #1',
        writers: 'Frank Darabont',
        director: 'Frank Darabont',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        plot: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in this sprawling, comedic crime caper.',
        releaseYear: 1994,
        genre: 'Crime',
        duration: 154,
        budget: 8000000,
        boxOffice: 214000000,
        awards: 'Academy Award for Best Original Screenplay; Palme d\'Or at Cannes Film Festival; Golden Globe for Best Screenplay',
        writers: 'Quentin Tarantino, Roger Avary',
        director: 'Quentin Tarantino',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Godfather',
        description: 'An organized crime dynasty\'s aging patriarch transfers control of his clandestine empire to his reluctant son.',
        plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son, who must deal with attempts on his father\'s life and a mafia war.',
        releaseYear: 1972,
        genre: 'Crime',
        duration: 175,
        budget: 6000000,
        boxOffice: 250000000,
        awards: 'Academy Awards for Best Picture, Best Actor (Marlon Brando), Best Adapted Screenplay; AFI\'s Greatest American Films #2',
        writers: 'Mario Puzo, Francis Ford Coppola',
        director: 'Francis Ford Coppola',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Forrest Gump',
        description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
        plot: 'Forrest Gump, while not intelligent, has accidentally been present at many historic moments, but his true love, Jenny Curran, eludes him.',
        releaseYear: 1994,
        genre: 'Drama',
        duration: 142,
        budget: 55000000,
        boxOffice: 678000000,
        awards: 'Academy Awards for Best Picture, Best Actor (Tom Hanks), Best Director, Best Adapted Screenplay, Best Visual Effects, Best Film Editing',
        writers: 'Eric Roth',
        director: 'Robert Zemeckis',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Matrix',
        description: 'A computer programmer discovers that reality as he knows it is a simulation and joins a rebellion to free humanity.',
        plot: 'Neo, a computer programmer, is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.',
        releaseYear: 1999,
        genre: 'Sci-Fi',
        duration: 136,
        budget: 63000000,
        boxOffice: 467000000,
        awards: 'Academy Awards for Best Visual Effects, Best Film Editing, Best Sound, Best Sound Effects Editing; BAFTA Awards for Best Achievement in Special Visual Effects, Best Sound',
        writers: 'Lana Wachowski, Lilly Wachowski',
        director: 'Lana Wachowski, Lilly Wachowski',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Goodfellas',
        description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.',
        plot: 'Henry Hill and his friends work their way up through the mob hierarchy over the course of several decades.',
        releaseYear: 1990,
        genre: 'Crime',
        duration: 146,
        budget: 25000000,
        boxOffice: 46800000,
        awards: 'Academy Award for Best Supporting Actor (Joe Pesci); BAFTA Awards for Best Adapted Screenplay, Best Editing, Best Costume Design',
        writers: 'Nicholas Pileggi, Martin Scorsese',
        director: 'Martin Scorsese',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Lord of the Rings: The Return of the King',
        description: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.',
        plot: 'The final confrontation between the forces of good and evil fighting for control of the future of Middle-earth.',
        releaseYear: 2003,
        genre: 'Fantasy',
        duration: 201,
        budget: 94000000,
        boxOffice: 1142000000,
        awards: 'Academy Awards for Best Picture, Best Director, Best Adapted Screenplay, and 8 other Oscars (11 total); BAFTA Awards for Best Film, Best Adapted Screenplay',
        writers: 'Fran Walsh, Philippa Boyens, Peter Jackson',
        director: 'Peter Jackson',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Fight Club',
        description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into an anarchist organization.',
        plot: 'A nameless first person narrator attends support groups in an attempt to subdue his emotional state and relieve his insomnia. When he meets Marla, another fake attendee of support groups, his life seems to become a little more bearable.',
        releaseYear: 1999,
        genre: 'Drama',
        duration: 139,
        budget: 63000000,
        boxOffice: 101000000,
        awards: 'MTV Movie Awards for Best Fight, Breakthrough Male Performance; Saturn Awards for Best Action/Adventure/Thriller Film',
        writers: 'Chuck Palahniuk, Jim Uhls',
        director: 'David Fincher',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        plot: 'Earth\'s future has been riddled by disasters, famines, and droughts. There is only one way to ensure mankind\'s survival: Interstellar travel.',
        releaseYear: 2014,
        genre: 'Sci-Fi',
        duration: 169,
        budget: 165000000,
        boxOffice: 677000000,
        awards: 'Academy Award for Best Visual Effects; BAFTA Awards for Best Special Visual Effects; Critics\' Choice Awards for Best Sci-Fi/Horror Movie',
        writers: 'Jonathan Nolan, Christopher Nolan',
        director: 'Christopher Nolan',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Avengers',
        description: 'Earth\'s mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.',
        plot: 'When an unexpected enemy emerges that threatens global safety and security, Nick Fury, Director of the international peacekeeping agency known as S.H.I.E.L.D., finds himself in need of a team to pull the world back from the brink of disaster.',
        releaseYear: 2012,
        genre: 'Action',
        duration: 143,
        budget: 220000000,
        boxOffice: 1518000000,
        awards: 'People\'s Choice Awards for Favorite Movie, Favorite Action Movie; Teen Choice Awards for Choice Movie: Action Adventure',
        writers: 'Joss Whedon, Zak Penn',
        director: 'Joss Whedon',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Titanic',
        description: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
        plot: 'A fictionalized account of the sinking of the RMS Titanic, it stars Leonardo DiCaprio and Kate Winslet as members of different social classes who fall in love aboard the ship during its ill-fated maiden voyage.',
        releaseYear: 1997,
        genre: 'Romance',
        duration: 194,
        budget: 200000000,
        boxOffice: 2187000000,
        awards: 'Academy Awards for Best Picture, Best Director, and 9 other Oscars (11 total); Golden Globe Awards for Best Motion Picture, Best Director',
        writers: 'James Cameron',
        director: 'James Cameron',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Gladiator',
        description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
        plot: 'Maximus is a powerful Roman general, loved by the people and the aging Emperor, Marcus Aurelius. Before his death, the Emperor chooses Maximus to be his heir over his own son, Commodus, and a power struggle leaves Maximus and his family condemned to death.',
        releaseYear: 2000,
        genre: 'Action',
        duration: 155,
        budget: 103000000,
        boxOffice: 457000000,
        awards: 'Academy Awards for Best Picture, Best Actor (Russell Crowe), Best Costume Design, Best Sound, Best Visual Effects; BAFTA Awards for Best Film, Best Cinematography',
        writers: 'David Franzoni, John Logan, William Nicholson',
        director: 'Ridley Scott',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Saving Private Ryan',
        description: 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',
        plot: 'As U.S. troops storm the beaches of Normandy, three brothers lie dead on the battlefield, with a fourth trapped behind enemy lines. Ranger captain John Miller and seven men are tasked with penetrating German-held territory and bringing the boy home.',
        releaseYear: 1998,
        genre: 'War',
        duration: 169,
        budget: 70000000,
        boxOffice: 482000000,
        awards: 'Academy Awards for Best Director (Steven Spielberg), Best Cinematography, Best Film Editing, Best Sound, Best Sound Effects Editing; Golden Globe for Best Motion Picture',
        writers: 'Robert Rodat',
        director: 'Steven Spielberg',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Dark Knight Rises',
        description: 'Eight years after the Joker\'s reign of anarchy, Batman, with the help of the enigmatic Catwoman, is forced from his exile to save Gotham City from the brutal guerrilla terrorist Bane.',
        plot: 'Following the death of District Attorney Harvey Dent, Batman assumes responsibility for Dent\'s crimes to protect the late attorney\'s reputation and is subsequently hunted by the Gotham City Police Department.',
        releaseYear: 2012,
        genre: 'Action',
        duration: 165,
        budget: 250000000,
        boxOffice: 1084000000,
        awards: 'People\'s Choice Awards for Favorite Movie, Favorite Action Movie; Teen Choice Awards for Choice Movie: Action Adventure',
        writers: 'Jonathan Nolan, Christopher Nolan',
        director: 'Christopher Nolan',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Schindler\'s List',
        description: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
        plot: 'The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.',
        releaseYear: 1993,
        genre: 'Biography',
        duration: 195,
        budget: 22000000,
        boxOffice: 322000000,
        awards: 'Academy Awards for Best Picture, Best Director (Steven Spielberg), Best Adapted Screenplay, and 4 other Oscars (7 total); BAFTA Awards for Best Film, Best Editing',
        writers: 'Thomas Keneally, Steven Zaillian',
        director: 'Steven Spielberg',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Casablanca',
        description: 'A cynical American expatriate struggles to decide whether or not he should help his former lover and her fugitive husband escape French Morocco.',
        plot: 'In Casablanca, Morocco in December 1941, a cynical American expatriate meets a former lover, with unforeseen complications.',
        releaseYear: 1942,
        genre: 'Romance',
        duration: 102,
        budget: 1000000,
        boxOffice: 3700000,
        awards: 'Academy Awards for Best Picture, Best Director (Michael Curtiz), Best Adapted Screenplay; AFI\'s 100 Years...100 Movies #3',
        writers: 'Julius J. Epstein, Philip G. Epstein, Howard Koch',
        director: 'Michael Curtiz',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Silence of the Lambs',
        description: 'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.',
        plot: 'Clarice Starling, a top student at the FBI\'s training academy, is instructed by her supervisor to interview Dr. Hannibal Lecter, a brilliant psychiatrist who is also a violent psychopath.',
        releaseYear: 1991,
        genre: 'Thriller',
        duration: 118,
        budget: 19000000,
        boxOffice: 272000000,
        awards: 'Academy Awards for Best Picture, Best Director, Best Actor (Anthony Hopkins), Best Actress (Jodie Foster), Best Adapted Screenplay; BAFTA Awards for Best Actor, Best Actress',
        writers: 'Thomas Harris, Ted Tally',
        director: 'Jonathan Demme',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Avatar',
        description: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
        plot: 'When his brother is killed in a robbery, paraplegic Marine Jake Sully decides to take his place in a mission on the distant world of Pandora.',
        releaseYear: 2009,
        genre: 'Sci-Fi',
        duration: 162,
        budget: 237000000,
        boxOffice: 2923000000,
        awards: 'Academy Awards for Best Cinematography, Best Production Design, Best Visual Effects; Golden Globe Awards for Best Motion Picture, Best Director',
        writers: 'James Cameron',
        director: 'James Cameron',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Dunkirk',
        description: 'Allied soldiers from Belgium, the British Commonwealth and Empire, and France are surrounded by the German Army and evacuated during a fierce battle in World War II.',
        plot: 'The story of the miraculous evacuation of Allied soldiers from Belgium, Britain, Canada and France, who were cut off and surrounded by the German army from the beaches and harbour of Dunkirk between May 26th and June 4th 1940.',
        releaseYear: 2017,
        genre: 'War',
        duration: 106,
        budget: 100000000,
        boxOffice: 526000000,
        awards: 'Academy Awards for Best Film Editing, Best Sound Editing, Best Sound Mixing; BAFTA Awards for Best Sound',
        writers: 'Christopher Nolan',
        director: 'Christopher Nolan',
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
  console.log(`📽️  Created ${movies.length + 1} movies (including test movie)`);
  console.log(`🎭 Created ${actors.length + 3} actors (including test actors)`);
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
