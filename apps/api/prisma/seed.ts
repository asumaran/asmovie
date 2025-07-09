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
  const hashedPassword = await bcrypt.hash('password', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@mail.test',
        password: hashedPassword,
        firstName: 'Jack',
        lastName: 'Black',
        isActive: true,
      },
    }),
  ]);

  // Create actors with complete data
  const actors = await Promise.all([
    prisma.actor.create({
      data: {
        name: 'Leonardo DiCaprio',
        birthDate: new Date('1974-11-11'),
        placeOfBirth: 'Los Angeles, California, USA',
        nationality: 'American',
        description:
          'Academy Award-winning actor known for environmental activism',
        biography:
          'American actor and film producer known for his work in biographical and period films. He has received numerous accolades, including an Academy Award, a British Academy Film Award, and three Golden Globe Awards. Known for his environmental activism.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Marion Cotillard',
        birthDate: new Date('1975-09-30'),
        placeOfBirth: 'Paris, France',
        nationality: 'French',
        description: 'Acclaimed French actress and environmental activist',
        biography:
          'French actress, singer, and environmentalist. She is known for her wide range of roles across independent films and blockbusters. She won the Academy Award for Best Actress for her portrayal of Édith Piaf in La Vie en Rose.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Tom Hardy',
        birthDate: new Date('1977-09-15'),
        placeOfBirth: 'Hammersmith, London, England',
        nationality: 'British',
        description:
          'Versatile English actor known for intense transformations',
        biography:
          'English actor and producer known for his versatile roles and physical transformations. He has appeared in films such as Inception, The Dark Knight Rises, Mad Max: Fury Road, and Venom.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Cillian Murphy',
        birthDate: new Date('1976-05-25'),
        placeOfBirth: 'Douglas, Cork, Ireland',
        nationality: 'Irish',
        description: 'Irish actor known for intense, brooding performances',
        biography:
          'Irish actor known for his work in both independent and blockbuster films. He is best known for playing Thomas Shelby in the BBC series Peaky Blinders and for his collaborations with director Christopher Nolan.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Morgan Freeman',
        birthDate: new Date('1937-06-01'),
        placeOfBirth: 'Memphis, Tennessee, USA',
        nationality: 'American',
        description:
          'Legendary actor with distinctive voice and commanding presence',
        biography:
          'American actor, director, and narrator known for his distinctive deep voice and various roles in a wide variety of film genres. He has received multiple accolades, including an Academy Award, a Screen Actors Guild Award, and a Golden Globe Award.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Tim Robbins',
        birthDate: new Date('1958-10-16'),
        placeOfBirth: 'West Covina, California, USA',
        nationality: 'American',
        description: 'Versatile actor, director, and political activist',
        biography:
          'American actor, director, and musician. He is known for his roles in films such as The Shawshank Redemption, Mystic River, and Dead Man Walking. He has won an Academy Award and two Golden Globe Awards.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Scarlett Johansson',
        birthDate: new Date('1984-11-22'),
        placeOfBirth: 'New York City, New York, USA',
        nationality: 'American',
        description:
          'Versatile actress known for both indie and blockbuster films',
        biography:
          "American actress and singer. She was the world's highest-paid actress in 2018 and 2019, and has featured multiple times on the Forbes Celebrity 100 list. She is known for her roles in Lost in Translation, The Avengers series, and Marriage Story.",
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Christian Bale',
        birthDate: new Date('1974-01-30'),
        placeOfBirth: 'Haverfordwest, Pembrokeshire, Wales',
        nationality: 'British',
        description: 'Method actor known for dramatic physical transformations',
        biography:
          'English actor known for his intense method acting style and radical physical transformations for his roles. He has received numerous accolades, including an Academy Award and two Golden Globe Awards. Known for The Dark Knight trilogy and The Machinist.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Natalie Portman',
        birthDate: new Date('1981-06-09'),
        placeOfBirth: 'Jerusalem, Israel',
        nationality: 'Israeli-American',
        description: 'Harvard-educated actress and director',
        biography:
          'Israeli-born American actress and director. She has won an Academy Award, a British Academy Film Award, and two Golden Globe Awards. Known for her roles in Black Swan, V for Vendetta, and the Star Wars prequel trilogy.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Russell Crowe',
        birthDate: new Date('1964-04-07'),
        placeOfBirth: 'Wellington, New Zealand',
        nationality: 'New Zealand-Australian',
        description: 'Intense actor known for historical and dramatic roles',
        biography:
          'New Zealand-born Australian actor, director, musician, and singer. He came to international attention for his role as Maximus Decimus Meridius in the historical epic film Gladiator, for which he won an Academy Award for Best Actor.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Kate Winslet',
        birthDate: new Date('1975-10-05'),
        placeOfBirth: 'Reading, Berkshire, England',
        nationality: 'British',
        description:
          'Acclaimed British actress known for dramatic performances',
        biography:
          'English actress known for her work in independent films, particularly period dramas. She has won an Academy Award, a Grammy Award, two Primetime Emmy Awards, and multiple BAFTA and Golden Globe Awards. Best known for Titanic and The Reader.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Robert Downey Jr.',
        birthDate: new Date('1965-04-04'),
        placeOfBirth: 'New York City, New York, USA',
        nationality: 'American',
        description: 'Charismatic actor who revitalized his career as Iron Man',
        biography:
          'American actor and producer. His career has been characterized by critical and popular success in his youth, followed by a period of substance abuse and legal troubles, before a resurgence of commercial success later in his career.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Joaquin Phoenix',
        birthDate: new Date('1974-10-28'),
        placeOfBirth: 'San Juan, Puerto Rico',
        nationality: 'American',
        description:
          'Intense method actor known for psychologically complex roles',
        biography:
          'American actor, producer, and animal rights activist. He has received numerous accolades, including an Academy Award, a British Academy Film Award, a Grammy Award, and two Golden Globe Awards. Known for Joker, Her, and Walk the Line.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Amy Adams',
        birthDate: new Date('1974-08-20'),
        placeOfBirth: 'Vicenza, Italy',
        nationality: 'American',
        description:
          'Versatile actress known for both comedic and dramatic roles',
        biography:
          'American actress known for both her comedic and dramatic performances. She has been featured three times in annual rankings of the highest-paid actresses in the world. She has received various accolades, including two Golden Globe Awards.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Matt Damon',
        birthDate: new Date('1970-10-08'),
        placeOfBirth: 'Cambridge, Massachusetts, USA',
        nationality: 'American',
        description: 'Versatile actor, writer, and producer',
        biography:
          "American actor, film producer, and screenwriter. He is ranked among Forbes magazine's most bankable stars and is one of the highest-grossing actors of all time. He won an Academy Award for Best Original Screenplay for Good Will Hunting.",
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Anne Hathaway',
        birthDate: new Date('1982-11-12'),
        placeOfBirth: 'Brooklyn, New York, USA',
        nationality: 'American',
        description:
          'Versatile actress known for dramatic and musical performances',
        biography:
          'American actress. She is the recipient of various accolades, including an Academy Award, a Golden Globe Award, and a Primetime Emmy Award. She was one of the highest-paid actresses in the world in 2015.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Michael Caine',
        birthDate: new Date('1933-03-14'),
        placeOfBirth: 'Rotherhithe, London, England',
        nationality: 'British',
        description: 'Legendary British actor with distinctive cockney accent',
        biography:
          'English actor. Known for his distinctive cockney accent, he has appeared in more than 130 films in a career spanning seven decades. He is ranked 20th on the list of highest-grossing box office stars.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Charlize Theron',
        birthDate: new Date('1975-08-07'),
        placeOfBirth: 'Benoni, South Africa',
        nationality: 'South African-American',
        description: 'Academy Award-winning actress and producer',
        biography:
          "South African and American actress and producer. One of the world's highest-paid actresses, she is the recipient of various accolades, including an Academy Award, a Screen Actors Guild Award, and a Golden Globe Award.",
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Anthony Hopkins',
        birthDate: new Date('1937-12-31'),
        placeOfBirth: 'Margam, Wales',
        nationality: 'British',
        description: 'Legendary Welsh actor known for iconic villainous roles',
        biography:
          'Welsh actor, director, and producer. He has received many accolades, including two Academy Awards, four BAFTAs, two Emmys, and the Cecil B. DeMille Award. He is best known for his portrayal of Hannibal Lecter in The Silence of the Lambs.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Jodie Foster',
        birthDate: new Date('1962-11-19'),
        placeOfBirth: 'Los Angeles, California, USA',
        nationality: 'American',
        description: 'Two-time Academy Award winner and director',
        biography:
          'American actress, director, and producer. She has received two Academy Awards, three British Academy Film Awards, two Golden Globe Awards, and the Cecil B. DeMille Award. She is known for The Silence of the Lambs and Taxi Driver.',
      },
    }),
    // Adding missing actors for movies without actors assigned
    prisma.actor.create({
      data: {
        name: 'John Travolta',
        birthDate: new Date('1954-02-18'),
        placeOfBirth: 'Englewood, New Jersey, USA',
        nationality: 'American',
        description: 'Iconic actor known for Saturday Night Fever and Pulp Fiction',
        biography:
          'American actor and singer known for his roles in Saturday Night Fever, Grease, and Pulp Fiction. He has been nominated for two Academy Awards and has won a Golden Globe Award.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Samuel L. Jackson',
        birthDate: new Date('1948-12-21'),
        placeOfBirth: 'Washington, D.C., USA',
        nationality: 'American',
        description: 'Prolific actor known for intense performances and distinctive voice',
        biography:
          'American actor and producer known for his roles in Pulp Fiction, Snakes on a Plane, and the Marvel Cinematic Universe. He is one of the highest-grossing actors of all time.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Uma Thurman',
        birthDate: new Date('1970-04-29'),
        placeOfBirth: 'Boston, Massachusetts, USA',
        nationality: 'American',
        description: 'Actress known for dramatic and action roles',
        biography:
          'American actress known for her roles in Pulp Fiction, Kill Bill, and Batman & Robin. She has been nominated for an Academy Award and has won a Golden Globe Award.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Marlon Brando',
        birthDate: new Date('1924-04-03'),
        placeOfBirth: 'Omaha, Nebraska, USA',
        nationality: 'American',
        description: 'Legendary method actor and cultural icon',
        biography:
          'American actor and film director widely regarded as one of the greatest actors in cinematic history. Known for The Godfather, A Streetcar Named Desire, and On the Waterfront.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Al Pacino',
        birthDate: new Date('1940-04-25'),
        placeOfBirth: 'New York City, New York, USA',
        nationality: 'American',
        description: 'Iconic actor known for intense dramatic performances',
        biography:
          'American actor and filmmaker known for his roles in The Godfather trilogy, Scarface, and Scent of a Woman. He has won an Academy Award, two Tony Awards, and two Primetime Emmy Awards.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Tom Hanks',
        birthDate: new Date('1956-07-09'),
        placeOfBirth: 'Concord, California, USA',
        nationality: 'American',
        description: 'Beloved actor known for everyman roles and dramatic range',
        biography:
          'American actor and filmmaker known for his roles in Forrest Gump, Philadelphia, Cast Away, and Toy Story. He has won two Academy Awards and is one of the most popular actors in Hollywood.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Keanu Reeves',
        birthDate: new Date('1964-09-02'),
        placeOfBirth: 'Beirut, Lebanon',
        nationality: 'Canadian',
        description: 'Versatile actor known for action and dramatic roles',
        biography:
          'Canadian actor known for his roles in The Matrix trilogy, John Wick series, and Speed. He is known for his philanthropic efforts and down-to-earth personality.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Laurence Fishburne',
        birthDate: new Date('1961-07-30'),
        placeOfBirth: 'Augusta, Georgia, USA',
        nationality: 'American',
        description: 'Accomplished actor known for powerful dramatic performances',
        biography:
          'American actor known for his roles in The Matrix trilogy, Boyz n the Hood, and What\'s Love Got to Do with It. He has won a Tony Award and has been nominated for an Academy Award.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Carrie-Anne Moss',
        birthDate: new Date('1967-08-21'),
        placeOfBirth: 'Burnaby, British Columbia, Canada',
        nationality: 'Canadian',
        description: 'Actress known for action and dramatic roles',
        biography:
          'Canadian actress known for her role as Trinity in The Matrix trilogy. She has also appeared in Memento, Red Planet, and Jessica Jones.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Joe Pesci',
        birthDate: new Date('1943-02-09'),
        placeOfBirth: 'Newark, New Jersey, USA',
        nationality: 'American',
        description: 'Actor known for intense supporting roles in crime films',
        biography:
          'American actor known for his roles in Goodfellas, Casino, and My Cousin Vinny. He has won an Academy Award for Best Supporting Actor and is known for his volatile screen persona.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Ray Liotta',
        birthDate: new Date('1954-12-18'),
        placeOfBirth: 'Newark, New Jersey, USA',
        nationality: 'American',
        description: 'Actor known for intense dramatic roles',
        biography:
          'American actor known for his roles in Goodfellas, Field of Dreams, and Something Wild. He was known for his intense screen presence and ability to portray complex characters.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Edward Norton',
        birthDate: new Date('1969-08-18'),
        placeOfBirth: 'Boston, Massachusetts, USA',
        nationality: 'American',
        description: 'Actor known for intense and complex performances',
        biography:
          'American actor and filmmaker known for his roles in Fight Club, American History X, and Birdman. He has been nominated for three Academy Awards and is known for his method acting approach.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Brad Pitt',
        birthDate: new Date('1963-12-18'),
        placeOfBirth: 'Shawnee, Oklahoma, USA',
        nationality: 'American',
        description: 'Leading man known for diverse roles and producing',
        biography:
          'American actor and film producer known for his roles in Fight Club, Ocean\'s trilogy, and Once Upon a Time in Hollywood. He has won an Academy Award and is one of the most recognizable actors in Hollywood.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Chris Evans',
        birthDate: new Date('1981-06-13'),
        placeOfBirth: 'Boston, Massachusetts, USA',
        nationality: 'American',
        description: 'Actor known for superhero and dramatic roles',
        biography:
          'American actor known for his role as Captain America in the Marvel Cinematic Universe. He has also appeared in Fantastic Four, Snowpiercer, and Knives Out.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Chris Hemsworth',
        birthDate: new Date('1983-08-11'),
        placeOfBirth: 'Melbourne, Australia',
        nationality: 'Australian',
        description: 'Actor known for action and superhero roles',
        biography:
          'Australian actor known for his role as Thor in the Marvel Cinematic Universe. He has also appeared in Rush, In the Heart of the Sea, and Extraction.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Mark Ruffalo',
        birthDate: new Date('1967-11-22'),
        placeOfBirth: 'Kenosha, Wisconsin, USA',
        nationality: 'American',
        description: 'Actor known for dramatic and superhero roles',
        biography:
          'American actor known for his role as Bruce Banner/Hulk in the Marvel Cinematic Universe. He has also appeared in Spotlight, The Kids Are All Right, and Zodiac.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Jeremy Renner',
        birthDate: new Date('1971-01-07'),
        placeOfBirth: 'Modesto, California, USA',
        nationality: 'American',
        description: 'Actor known for intense action and dramatic roles',
        biography:
          'American actor known for his role as Hawkeye in the Marvel Cinematic Universe. He has also appeared in The Hurt Locker, The Town, and Wind River.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Humphrey Bogart',
        birthDate: new Date('1899-12-25'),
        placeOfBirth: 'New York City, New York, USA',
        nationality: 'American',
        description: 'Legendary actor of Hollywood\'s Golden Age',
        biography:
          'American actor known for his roles in Casablanca, The Maltese Falcon, and The African Queen. He is considered one of the greatest actors in Hollywood history.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Ingrid Bergman',
        birthDate: new Date('1915-08-29'),
        placeOfBirth: 'Stockholm, Sweden',
        nationality: 'Swedish',
        description: 'Legendary actress of Hollywood\'s Golden Age',
        biography:
          'Swedish actress known for her roles in Casablanca, Notorious, and Gaslight. She won three Academy Awards and is considered one of the greatest actresses in film history.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Liam Neeson',
        birthDate: new Date('1952-06-07'),
        placeOfBirth: 'Ballymena, Northern Ireland',
        nationality: 'British',
        description: 'Actor known for dramatic and action roles',
        biography:
          'Northern Irish actor known for his roles in Schindler\'s List, Taken, and The Grey. He has been nominated for an Academy Award and is known for his distinctive voice and commanding presence.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Ben Kingsley',
        birthDate: new Date('1943-12-31'),
        placeOfBirth: 'Scarborough, Yorkshire, England',
        nationality: 'British',
        description: 'Accomplished actor known for transformative performances',
        biography:
          'British actor known for his roles in Gandhi, Schindler\'s List, and Sexy Beast. He has won an Academy Award and is known for his ability to completely transform into his characters.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Gary Oldman',
        birthDate: new Date('1958-03-21'),
        placeOfBirth: 'New Cross, London, England',
        nationality: 'British',
        description: 'Chameleon-like actor known for transformative roles',
        biography:
          'English actor known for his roles in Léon: The Professional, The Dark Knight trilogy, and Darkest Hour. He has won an Academy Award and is known for his ability to disappear into his roles.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Tom Cruise',
        birthDate: new Date('1962-07-03'),
        placeOfBirth: 'Syracuse, New York, USA',
        nationality: 'American',
        description: 'Action star known for performing his own stunts',
        biography:
          'American actor known for his roles in Top Gun, Mission: Impossible series, and Jerry Maguire. He is known for performing his own stunts and is one of the highest-grossing actors of all time.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Val Kilmer',
        birthDate: new Date('1959-12-31'),
        placeOfBirth: 'Los Angeles, California, USA',
        nationality: 'American',
        description: 'Actor known for intense dramatic and action roles',
        biography:
          'American actor known for his roles in Top Gun, The Doors, and Batman Forever. He is known for his method acting approach and intense preparation for roles.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Sigourney Weaver',
        birthDate: new Date('1949-10-08'),
        placeOfBirth: 'New York City, New York, USA',
        nationality: 'American',
        description: 'Actress known for strong action and dramatic roles',
        biography:
          'American actress known for her roles in the Alien franchise, Ghostbusters, and Avatar. She has been nominated for three Academy Awards and is known for her strong, independent characters.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Sam Worthington',
        birthDate: new Date('1976-08-02'),
        placeOfBirth: 'Godalming, Surrey, England',
        nationality: 'Australian',
        description: 'Actor known for action and science fiction roles',
        biography:
          'Australian actor known for his roles in Avatar, Terminator Salvation, and Clash of the Titans. He rose to international fame with his starring role in Avatar.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Zoe Saldana',
        birthDate: new Date('1978-06-19'),
        placeOfBirth: 'Passaic, New Jersey, USA',
        nationality: 'American',
        description: 'Actress known for action and science fiction roles',
        biography:
          'American actress known for her roles in Avatar, Star Trek, and Guardians of the Galaxy. She has appeared in some of the highest-grossing films of all time.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Matthew McConaughey',
        birthDate: new Date('1969-11-04'),
        placeOfBirth: 'Uvalde, Texas, USA',
        nationality: 'American',
        description: 'Actor known for dramatic and romantic roles',
        biography:
          'American actor known for his roles in Dallas Buyers Club, Interstellar, and True Detective. He has won an Academy Award and is known for his distinctive voice and philosophical approach to acting.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Elijah Wood',
        birthDate: new Date('1981-01-28'),
        placeOfBirth: 'Cedar Rapids, Iowa, USA',
        nationality: 'American',
        description: 'Actor known for fantasy and dramatic roles',
        biography:
          'American actor known for his role as Frodo Baggins in The Lord of the Rings trilogy. He has also appeared in Sin City, Eternal Sunshine of the Spotless Mind, and Green Street.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Viggo Mortensen',
        birthDate: new Date('1958-10-20'),
        placeOfBirth: 'New York City, New York, USA',
        nationality: 'American',
        description: 'Versatile actor known for intense dramatic roles',
        biography:
          'American actor known for his role as Aragorn in The Lord of the Rings trilogy. He has also appeared in Eastern Promises, A History of Violence, and Green Book.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Sean Bean',
        birthDate: new Date('1959-04-17'),
        placeOfBirth: 'Handsworth, Sheffield, England',
        nationality: 'British',
        description: 'Actor known for heroic and villainous roles',
        biography:
          'English actor known for his roles in The Lord of the Rings trilogy, Game of Thrones, and GoldenEye. He is known for often playing characters who meet dramatic ends.',
      },
    }),
    prisma.actor.create({
      data: {
        name: 'Ian McKellen',
        birthDate: new Date('1939-05-25'),
        placeOfBirth: 'Burnley, Lancashire, England',
        nationality: 'British',
        description: 'Legendary stage and film actor',
        biography:
          'English actor known for his roles as Gandalf in The Lord of the Rings and The Hobbit trilogies, and as Magneto in the X-Men films. He is a classically trained actor with extensive stage experience.',
      },
    }),
  ]);

  // Create comprehensive movie data with actors using the new approach
  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        title: 'Inception',
        description:
          'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        plot: 'Dom Cobb is a skilled thief who steals secrets from people\'s subconscious minds while they dream. He is offered a chance to have his criminal record erased in exchange for performing an "inception" - planting an idea deep within someone\'s mind rather than stealing one.',
        releaseYear: 2010,
        genre: 'Sci-Fi',
        duration: 148,
        budget: 160000000,
        boxOffice: 836800000,
        awards:
          'Academy Award for Best Cinematography, Best Sound Editing, Best Sound Mixing, Best Visual Effects; BAFTA Awards for Best Production Design, Best Special Visual Effects, Best Sound',
        writers: 'Christopher Nolan',
        director: 'Christopher Nolan',
        actors: {
          createMany: {
            data: [
              { actorId: actors[0].id, role: 'Dom Cobb' }, // Leonardo DiCaprio
              { actorId: actors[1].id, role: 'Mal' }, // Marion Cotillard
              { actorId: actors[2].id, role: 'Eames' }, // Tom Hardy
              { actorId: actors[3].id, role: 'Robert Fischer' }, // Cillian Murphy
              { actorId: actors[16].id, role: 'Professor Miles' }, // Michael Caine
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Dark Knight',
        description:
          'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        plot: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent. Together they take on Gotham's organized crime and encounter the Joker, a criminal mastermind who wants to plunge the city into anarchy.",
        releaseYear: 2008,
        genre: 'Action',
        duration: 152,
        budget: 185000000,
        boxOffice: 1004000000,
        awards:
          'Academy Award for Best Supporting Actor (Heath Ledger); BAFTA Award for Best Supporting Actor; Golden Globe for Best Supporting Actor',
        writers: 'Jonathan Nolan, Christopher Nolan',
        director: 'Christopher Nolan',
        actors: {
          createMany: {
            data: [
              { actorId: actors[7].id, role: 'Batman / Bruce Wayne' }, // Christian Bale
              { actorId: actors[16].id, role: 'Alfred Pennyworth' }, // Michael Caine
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Shawshank Redemption',
        description:
          'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        plot: 'Banker Andy Dufresne is sentenced to life in Shawshank State Penitentiary for the murders of his wife and her lover, despite his claims of innocence. Over the next two decades, he befriends a fellow prisoner, contraband smuggler Ellis "Red" Redding, and becomes instrumental in a money laundering operation.',
        releaseYear: 1994,
        genre: 'Drama',
        duration: 142,
        budget: 25000000,
        boxOffice: 16000000,
        awards:
          "Nominated for 7 Academy Awards including Best Picture; AFI's 100 Years...100 Movies (10th Anniversary Edition) #1",
        writers: 'Frank Darabont',
        director: 'Frank Darabont',
        actors: {
          createMany: {
            data: [
              { actorId: actors[4].id, role: 'Ellis Boyd "Red" Redding' }, // Morgan Freeman
              { actorId: actors[5].id, role: 'Andy Dufresne' }, // Tim Robbins
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Pulp Fiction',
        description:
          'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        plot: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
        releaseYear: 1994,
        genre: 'Crime',
        duration: 154,
        budget: 8000000,
        boxOffice: 214000000,
        awards:
          "Academy Award for Best Original Screenplay; Palme d'Or at Cannes Film Festival; Golden Globe for Best Screenplay",
        writers: 'Quentin Tarantino, Roger Avary',
        director: 'Quentin Tarantino',
        actors: {
          createMany: {
            data: [
              { actorId: actors[20].id, role: 'Vincent Vega' }, // John Travolta
              { actorId: actors[21].id, role: 'Jules Winnfield' }, // Samuel L. Jackson
              { actorId: actors[22].id, role: 'Mia Wallace' }, // Uma Thurman
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Godfather',
        description:
          "An organized crime dynasty's aging patriarch transfers control of his clandestine empire to his reluctant son.",
        plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son, who must deal with attempts on his father's life and a mafia war.",
        releaseYear: 1972,
        genre: 'Crime',
        duration: 175,
        budget: 6000000,
        boxOffice: 250000000,
        awards:
          "Academy Awards for Best Picture, Best Actor (Marlon Brando), Best Adapted Screenplay; AFI's Greatest American Films #2",
        writers: 'Mario Puzo, Francis Ford Coppola',
        director: 'Francis Ford Coppola',
        actors: {
          createMany: {
            data: [
              { actorId: actors[23].id, role: 'Don Vito Corleone' }, // Marlon Brando
              { actorId: actors[24].id, role: 'Michael Corleone' }, // Al Pacino
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Forrest Gump',
        description:
          'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
        plot: 'Forrest Gump, while not intelligent, has accidentally been present at many historic moments, but his true love, Jenny Curran, eludes him.',
        releaseYear: 1994,
        genre: 'Drama',
        duration: 142,
        budget: 55000000,
        boxOffice: 678000000,
        awards:
          'Academy Awards for Best Picture, Best Actor (Tom Hanks), Best Director, Best Adapted Screenplay, Best Visual Effects, Best Film Editing',
        writers: 'Eric Roth',
        director: 'Robert Zemeckis',
        actors: {
          createMany: {
            data: [
              { actorId: actors[25].id, role: 'Forrest Gump' }, // Tom Hanks
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Matrix',
        description:
          'A computer programmer discovers that reality as he knows it is a simulation and joins a rebellion to free humanity.',
        plot: 'Neo, a computer programmer, is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.',
        releaseYear: 1999,
        genre: 'Sci-Fi',
        duration: 136,
        budget: 63000000,
        boxOffice: 467000000,
        awards:
          'Academy Awards for Best Visual Effects, Best Film Editing, Best Sound, Best Sound Effects Editing; BAFTA Awards for Best Achievement in Special Visual Effects, Best Sound',
        writers: 'Lana Wachowski, Lilly Wachowski',
        director: 'Lana Wachowski, Lilly Wachowski',
        actors: {
          createMany: {
            data: [
              { actorId: actors[26].id, role: 'Neo' }, // Keanu Reeves
              { actorId: actors[27].id, role: 'Morpheus' }, // Laurence Fishburne
              { actorId: actors[28].id, role: 'Trinity' }, // Carrie-Anne Moss
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Goodfellas',
        description:
          'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.',
        plot: 'Henry Hill and his friends work their way up through the mob hierarchy over the course of several decades.',
        releaseYear: 1990,
        genre: 'Crime',
        duration: 146,
        budget: 25000000,
        boxOffice: 46800000,
        awards:
          'Academy Award for Best Supporting Actor (Joe Pesci); BAFTA Awards for Best Adapted Screenplay, Best Editing, Best Costume Design',
        writers: 'Nicholas Pileggi, Martin Scorsese',
        director: 'Martin Scorsese',
        actors: {
          createMany: {
            data: [
              { actorId: actors[30].id, role: 'Henry Hill' }, // Ray Liotta
              { actorId: actors[29].id, role: 'Tommy DeVito' }, // Joe Pesci
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Lord of the Rings: The Return of the King',
        description:
          "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
        plot: 'The final confrontation between the forces of good and evil fighting for control of the future of Middle-earth.',
        releaseYear: 2003,
        genre: 'Fantasy',
        duration: 201,
        budget: 94000000,
        boxOffice: 1142000000,
        awards:
          'Academy Awards for Best Picture, Best Director, Best Adapted Screenplay, and 8 other Oscars (11 total); BAFTA Awards for Best Film, Best Adapted Screenplay',
        writers: 'Fran Walsh, Philippa Boyens, Peter Jackson',
        director: 'Peter Jackson',
        actors: {
          createMany: {
            data: [
              { actorId: actors[48].id, role: 'Frodo Baggins' }, // Elijah Wood
              { actorId: actors[49].id, role: 'Aragorn' }, // Viggo Mortensen
              { actorId: actors[50].id, role: 'Boromir' }, // Sean Bean
              { actorId: actors[51].id, role: 'Gandalf' }, // Ian McKellen
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Fight Club',
        description:
          'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into an anarchist organization.',
        plot: 'A nameless first person narrator attends support groups in an attempt to subdue his emotional state and relieve his insomnia. When he meets Marla, another fake attendee of support groups, his life seems to become a little more bearable.',
        releaseYear: 1999,
        genre: 'Drama',
        duration: 139,
        budget: 63000000,
        boxOffice: 101000000,
        awards:
          'MTV Movie Awards for Best Fight, Breakthrough Male Performance; Saturn Awards for Best Action/Adventure/Thriller Film',
        writers: 'Chuck Palahniuk, Jim Uhls',
        director: 'David Fincher',
        actors: {
          createMany: {
            data: [
              { actorId: actors[31].id, role: 'The Narrator' }, // Edward Norton
              { actorId: actors[32].id, role: 'Tyler Durden' }, // Brad Pitt
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Interstellar',
        description:
          "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        plot: "Earth's future has been riddled by disasters, famines, and droughts. There is only one way to ensure mankind's survival: Interstellar travel.",
        releaseYear: 2014,
        genre: 'Sci-Fi',
        duration: 169,
        budget: 165000000,
        boxOffice: 677000000,
        awards:
          "Academy Award for Best Visual Effects; BAFTA Awards for Best Special Visual Effects; Critics' Choice Awards for Best Sci-Fi/Horror Movie",
        writers: 'Jonathan Nolan, Christopher Nolan',
        director: 'Christopher Nolan',
        actors: {
          createMany: {
            data: [
              { actorId: actors[47].id, role: 'Cooper' }, // Matthew McConaughey
              { actorId: actors[15].id, role: 'Brand' }, // Anne Hathaway
              { actorId: actors[16].id, role: 'Professor Brand' }, // Michael Caine
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Avengers',
        description:
          "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.",
        plot: 'When an unexpected enemy emerges that threatens global safety and security, Nick Fury, Director of the international peacekeeping agency known as S.H.I.E.L.D., finds himself in need of a team to pull the world back from the brink of disaster.',
        releaseYear: 2012,
        genre: 'Action',
        duration: 143,
        budget: 220000000,
        boxOffice: 1518000000,
        awards:
          "People's Choice Awards for Favorite Movie, Favorite Action Movie; Teen Choice Awards for Choice Movie: Action Adventure",
        writers: 'Joss Whedon, Zak Penn',
        director: 'Joss Whedon',
        actors: {
          createMany: {
            data: [
              { actorId: actors[11].id, role: 'Tony Stark / Iron Man' }, // Robert Downey Jr.
              { actorId: actors[33].id, role: 'Steve Rogers / Captain America' }, // Chris Evans
              { actorId: actors[34].id, role: 'Thor' }, // Chris Hemsworth
              { actorId: actors[35].id, role: 'Bruce Banner / Hulk' }, // Mark Ruffalo
              { actorId: actors[36].id, role: 'Clint Barton / Hawkeye' }, // Jeremy Renner
              { actorId: actors[6].id, role: 'Natasha Romanoff / Black Widow' }, // Scarlett Johansson
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Titanic',
        description:
          'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
        plot: 'A fictionalized account of the sinking of the RMS Titanic, it stars Leonardo DiCaprio and Kate Winslet as members of different social classes who fall in love aboard the ship during its ill-fated maiden voyage.',
        releaseYear: 1997,
        genre: 'Romance',
        duration: 194,
        budget: 200000000,
        boxOffice: 2187000000,
        awards:
          'Academy Awards for Best Picture, Best Director, and 9 other Oscars (11 total); Golden Globe Awards for Best Motion Picture, Best Director',
        writers: 'James Cameron',
        director: 'James Cameron',
        actors: {
          createMany: {
            data: [
              { actorId: actors[0].id, role: 'Jack Dawson' }, // Leonardo DiCaprio
              { actorId: actors[10].id, role: 'Rose DeWitt Bukater' }, // Kate Winslet
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Gladiator',
        description:
          'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
        plot: 'Maximus is a powerful Roman general, loved by the people and the aging Emperor, Marcus Aurelius. Before his death, the Emperor chooses Maximus to be his heir over his own son, Commodus, and a power struggle leaves Maximus and his family condemned to death.',
        releaseYear: 2000,
        genre: 'Action',
        duration: 155,
        budget: 103000000,
        boxOffice: 457000000,
        awards:
          'Academy Awards for Best Picture, Best Actor (Russell Crowe), Best Costume Design, Best Sound, Best Visual Effects; BAFTA Awards for Best Film, Best Cinematography',
        writers: 'David Franzoni, John Logan, William Nicholson',
        director: 'Ridley Scott',
        actors: {
          createMany: {
            data: [
              { actorId: actors[9].id, role: 'Maximus Decimus Meridius' }, // Russell Crowe
              { actorId: actors[12].id, role: 'Commodus' }, // Joaquin Phoenix
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Saving Private Ryan',
        description:
          'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',
        plot: 'As U.S. troops storm the beaches of Normandy, three brothers lie dead on the battlefield, with a fourth trapped behind enemy lines. Ranger captain John Miller and seven men are tasked with penetrating German-held territory and bringing the boy home.',
        releaseYear: 1998,
        genre: 'War',
        duration: 169,
        budget: 70000000,
        boxOffice: 482000000,
        awards:
          'Academy Awards for Best Director (Steven Spielberg), Best Cinematography, Best Film Editing, Best Sound, Best Sound Effects Editing; Golden Globe for Best Motion Picture',
        writers: 'Robert Rodat',
        director: 'Steven Spielberg',
        actors: {
          createMany: {
            data: [
              { actorId: actors[25].id, role: 'Captain John Miller' }, // Tom Hanks
              { actorId: actors[14].id, role: 'Private James Ryan' }, // Matt Damon
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Dark Knight Rises',
        description:
          "Eight years after the Joker's reign of anarchy, Batman, with the help of the enigmatic Catwoman, is forced from his exile to save Gotham City from the brutal guerrilla terrorist Bane.",
        plot: "Following the death of District Attorney Harvey Dent, Batman assumes responsibility for Dent's crimes to protect the late attorney's reputation and is subsequently hunted by the Gotham City Police Department.",
        releaseYear: 2012,
        genre: 'Action',
        duration: 165,
        budget: 250000000,
        boxOffice: 1084000000,
        awards:
          "People's Choice Awards for Favorite Movie, Favorite Action Movie; Teen Choice Awards for Choice Movie: Action Adventure",
        writers: 'Jonathan Nolan, Christopher Nolan',
        director: 'Christopher Nolan',
        actors: {
          createMany: {
            data: [
              { actorId: actors[7].id, role: 'Batman / Bruce Wayne' }, // Christian Bale
              { actorId: actors[2].id, role: 'Bane' }, // Tom Hardy
              { actorId: actors[16].id, role: 'Alfred Pennyworth' }, // Michael Caine
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: "Schindler's List",
        description:
          'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
        plot: 'The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.',
        releaseYear: 1993,
        genre: 'Biography',
        duration: 195,
        budget: 22000000,
        boxOffice: 322000000,
        awards:
          'Academy Awards for Best Picture, Best Director (Steven Spielberg), Best Adapted Screenplay, and 4 other Oscars (7 total); BAFTA Awards for Best Film, Best Editing',
        writers: 'Thomas Keneally, Steven Zaillian',
        director: 'Steven Spielberg',
        actors: {
          createMany: {
            data: [
              { actorId: actors[39].id, role: 'Oskar Schindler' }, // Liam Neeson
              { actorId: actors[40].id, role: 'Amon Goeth' }, // Ben Kingsley
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Casablanca',
        description:
          'A cynical American expatriate struggles to decide whether or not he should help his former lover and her fugitive husband escape French Morocco.',
        plot: 'In Casablanca, Morocco in December 1941, a cynical American expatriate meets a former lover, with unforeseen complications.',
        releaseYear: 1942,
        genre: 'Romance',
        duration: 102,
        budget: 1000000,
        boxOffice: 3700000,
        awards:
          "Academy Awards for Best Picture, Best Director (Michael Curtiz), Best Adapted Screenplay; AFI's 100 Years...100 Movies #3",
        writers: 'Julius J. Epstein, Philip G. Epstein, Howard Koch',
        director: 'Michael Curtiz',
        actors: {
          createMany: {
            data: [
              { actorId: actors[37].id, role: 'Rick Blaine' }, // Humphrey Bogart
              { actorId: actors[38].id, role: 'Ilsa Lund' }, // Ingrid Bergman
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Silence of the Lambs',
        description:
          'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.',
        plot: "Clarice Starling, a top student at the FBI's training academy, is instructed by her supervisor to interview Dr. Hannibal Lecter, a brilliant psychiatrist who is also a violent psychopath.",
        releaseYear: 1991,
        genre: 'Thriller',
        duration: 118,
        budget: 19000000,
        boxOffice: 272000000,
        awards:
          'Academy Awards for Best Picture, Best Director, Best Actor (Anthony Hopkins), Best Actress (Jodie Foster), Best Adapted Screenplay; BAFTA Awards for Best Actor, Best Actress',
        writers: 'Thomas Harris, Ted Tally',
        director: 'Jonathan Demme',
        actors: {
          createMany: {
            data: [
              { actorId: actors[18].id, role: 'Dr. Hannibal Lecter' }, // Anthony Hopkins
              { actorId: actors[19].id, role: 'Clarice Starling' }, // Jodie Foster
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Avatar',
        description:
          'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
        plot: 'When his brother is killed in a robbery, paraplegic Marine Jake Sully decides to take his place in a mission on the distant world of Pandora.',
        releaseYear: 2009,
        genre: 'Sci-Fi',
        duration: 162,
        budget: 237000000,
        boxOffice: 2923000000,
        awards:
          'Academy Awards for Best Cinematography, Best Production Design, Best Visual Effects; Golden Globe Awards for Best Motion Picture, Best Director',
        writers: 'James Cameron',
        director: 'James Cameron',
        actors: {
          createMany: {
            data: [
              { actorId: actors[44].id, role: 'Jake Sully' }, // Sam Worthington
              { actorId: actors[45].id, role: 'Neytiri' }, // Zoe Saldana
              { actorId: actors[43].id, role: 'Dr. Grace Augustine' }, // Sigourney Weaver
            ],
          },
        },
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Dunkirk',
        description:
          'Allied soldiers from Belgium, the British Commonwealth and Empire, and France are surrounded by the German Army and evacuated during a fierce battle in World War II.',
        plot: 'The story of the miraculous evacuation of Allied soldiers from Belgium, Britain, Canada and France, who were cut off and surrounded by the German army from the beaches and harbour of Dunkirk between May 26th and June 4th 1940.',
        releaseYear: 2017,
        genre: 'War',
        duration: 106,
        budget: 100000000,
        boxOffice: 526000000,
        awards:
          'Academy Awards for Best Film Editing, Best Sound Editing, Best Sound Mixing; BAFTA Awards for Best Sound',
        writers: 'Christopher Nolan',
        director: 'Christopher Nolan',
        actors: {
          createMany: {
            data: [
              { actorId: actors[2].id, role: 'Farrier' }, // Tom Hardy
              { actorId: actors[3].id, role: 'Shivering Soldier' }, // Cillian Murphy
            ],
          },
        },
      },
    }),
  ]);

  // Las relaciones de actores para películas ya configuradas se crean automáticamente
  // Las películas restantes mantienen el patrón anterior para compatibilidad

  // Create movie ratings for 95% of movies (approximately 20 out of 21 movies)
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

    // The Dark Knight ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[1].id,
        rating: 9.0,
        comment: "Heath Ledger's performance is legendary",
        reviewer: 'Batman Fan',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[1].id,
        rating: 8.9,
        comment: 'Best superhero movie ever made',
        reviewer: 'Comic Book Enthusiast',
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

    // Pulp Fiction ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[3].id,
        rating: 8.9,
        comment: 'Tarantino at his finest',
        reviewer: 'Film Critic B',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[3].id,
        rating: 8.7,
        comment: 'Iconic dialogue and non-linear storytelling',
        reviewer: 'Indie Film Fan',
      },
    }),

    // The Godfather ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[4].id,
        rating: 9.2,
        comment: 'The definitive crime saga',
        reviewer: 'Classic Cinema Expert',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[4].id,
        rating: 9.4,
        comment: "Marlon Brando's iconic performance",
        reviewer: 'Acting Coach',
      },
    }),

    // Forrest Gump ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[5].id,
        rating: 8.8,
        comment: 'Heartwarming and inspiring',
        reviewer: 'Family Film Reviewer',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[5].id,
        rating: 8.5,
        comment: 'Tom Hanks delivers a career-defining performance',
        reviewer: 'Drama Enthusiast',
      },
    }),

    // The Matrix ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[6].id,
        rating: 8.7,
        comment: 'Revolutionary visual effects and philosophical depth',
        reviewer: 'Sci-Fi Critic',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[6].id,
        rating: 8.9,
        comment: 'Changed cinema forever',
        reviewer: 'Tech Film Analyst',
      },
    }),

    // Goodfellas ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[7].id,
        rating: 8.7,
        comment: "Scorsese's masterpiece about organized crime",
        reviewer: 'Crime Film Expert',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[7].id,
        rating: 8.8,
        comment: 'Ray Liotta and Joe Pesci are phenomenal',
        reviewer: 'Character Study Fan',
      },
    }),

    // The Lord of the Rings: The Return of the King ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[8].id,
        rating: 9.0,
        comment: 'Epic conclusion to the greatest trilogy',
        reviewer: 'Fantasy Film Lover',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[8].id,
        rating: 8.9,
        comment: "Peter Jackson's vision brought to life perfectly",
        reviewer: 'Epic Film Critic',
      },
    }),

    // Fight Club ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[9].id,
        rating: 8.8,
        comment: 'Mind-bending psychological thriller',
        reviewer: 'Psychological Film Analyst',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[9].id,
        rating: 8.6,
        comment: 'Dark commentary on consumer culture',
        reviewer: 'Social Commentary Critic',
      },
    }),

    // Interstellar ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[10].id,
        rating: 8.6,
        comment: 'Visually stunning space odyssey',
        reviewer: 'Space Film Enthusiast',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[10].id,
        rating: 8.7,
        comment: "Nolan's most emotional and ambitious film",
        reviewer: 'Nolan Film Expert',
      },
    }),

    // The Avengers ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[11].id,
        rating: 8.0,
        comment: 'Perfect superhero team-up movie',
        reviewer: 'Marvel Fan',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[11].id,
        rating: 7.9,
        comment: 'Great action sequences and character dynamics',
        reviewer: 'Action Film Critic',
      },
    }),

    // Titanic ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[12].id,
        rating: 7.8,
        comment: 'Epic romance with spectacular visuals',
        reviewer: 'Romance Film Critic',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[12].id,
        rating: 8.0,
        comment: "James Cameron's technical masterpiece",
        reviewer: 'Technical Film Analyst',
      },
    }),

    // Gladiator ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[13].id,
        rating: 8.5,
        comment: 'Russell Crowe delivers a powerful performance',
        reviewer: 'Historical Drama Fan',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[13].id,
        rating: 8.4,
        comment: 'Epic tale of revenge and redemption',
        reviewer: 'Action Drama Critic',
      },
    }),

    // Saving Private Ryan ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[14].id,
        rating: 8.6,
        comment: 'Intense and realistic war film',
        reviewer: 'War Film Specialist',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[14].id,
        rating: 8.7,
        comment: "Spielberg's masterful direction",
        reviewer: 'Director Study Expert',
      },
    }),

    // The Dark Knight Rises ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[15].id,
        rating: 8.4,
        comment: 'Epic conclusion to the trilogy',
        reviewer: 'Batman Fan',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[15].id,
        rating: 8.2,
        comment: "Tom Hardy's Bane is terrifying",
        reviewer: 'Villain Analysis Expert',
      },
    }),

    // Schindler\'s List ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[16].id,
        rating: 9.0,
        comment: 'Powerful and important historical drama',
        reviewer: 'Historical Film Critic',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[16].id,
        rating: 9.1,
        comment: "Spielberg's most important work",
        reviewer: 'Holocaust Film Scholar',
      },
    }),

    // Casablanca ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[17].id,
        rating: 8.5,
        comment: 'Timeless classic with iconic dialogue',
        reviewer: 'Golden Age Film Expert',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[17].id,
        rating: 8.7,
        comment: 'Perfect wartime romance',
        reviewer: 'Classic Romance Critic',
      },
    }),

    // The Silence of the Lambs ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[18].id,
        rating: 8.6,
        comment: "Hopkins' Hannibal Lecter is unforgettable",
        reviewer: 'Thriller Film Critic',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[18].id,
        rating: 8.8,
        comment: 'Psychological horror at its finest',
        reviewer: 'Horror Film Specialist',
      },
    }),

    // Avatar ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[19].id,
        rating: 7.8,
        comment: 'Groundbreaking visual effects',
        reviewer: 'VFX Film Critic',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[19].id,
        rating: 7.6,
        comment: 'Stunning world-building and cinematography',
        reviewer: 'Visual Storytelling Expert',
      },
    }),

    // Dunkirk ratings
    prisma.movieRating.create({
      data: {
        movieId: movies[20].id,
        rating: 8.6,
        comment: 'Intense and immersive war film',
        reviewer: 'War Film Enthusiast',
      },
    }),
    prisma.movieRating.create({
      data: {
        movieId: movies[20].id,
        rating: 8.4,
        comment: "Nolan's unique approach to war storytelling",
        reviewer: 'War Cinema Historian',
      },
    }),

    // Note: Leaving one movie (Test Movie) without ratings to achieve ~95% coverage
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
        actors: {
          createMany: {
            data: [
              { actorId: testActors[0].id, role: 'Main Role' }, // Test Actor (first test actor)
            ],
          },
        },
      },
    }),
    // Ejemplo de crear película con múltiples actores usando el nuevo enfoque
    prisma.movie.create({
      data: {
        title: 'Example Movie with Multiple Actors',
        description:
          'Demonstrates creating a movie with multiple actors at once',
        plot: 'This movie shows how to create a movie with multiple actors assigned during creation',
        releaseYear: 2024,
        genre: 'Example',
        duration: 90,
        budget: 5000000,
        boxOffice: 25000000,
        director: 'Example Director',
        writers: 'Example Writer',
        actors: {
          createMany: {
            data: [
              { actorId: actors[0].id, role: 'Lead Actor' }, // Leonardo DiCaprio
              { actorId: actors[1].id, role: 'Supporting Actress' }, // Marion Cotillard
              { actorId: actors[2].id, role: 'Villain' }, // Tom Hardy
              { actorId: testActors[0].id, role: 'Cameo' }, // Test Actor
            ],
          },
        },
      },
    }),
    // Ejemplo de crear película sin actores para demostrar ese caso
    prisma.movie.create({
      data: {
        title: 'Movie Without Actors',
        description: 'Example of a movie created without actors initially',
        plot: 'This movie demonstrates creating a movie without actors, they can be added later',
        releaseYear: 2024,
        genre: 'Documentary',
        duration: 60,
        director: 'Documentary Director',
        writers: 'Documentary Writer',
        // No actors field - will be empty initially
      },
    }),
  ]);

  // Las relaciones de actores se crean automáticamente durante la creación de películas

  console.log('✅ Database seeded successfully!');
  console.log(`👥 Created ${users.length} users`);
  console.log(
    `📽️  Created ${movies.length + 3} movies (including test movies)`,
  );
  console.log(
    `🎭 Created ${actors.length + 3} actors (20 main actors + 3 test actors)`,
  );
  console.log(`🎬 Created movie-actor relationships using new approach`);
  console.log(
    `⭐ Created ratings for ${movies.length} out of ${movies.length + 3} movies (${Math.round((movies.length / (movies.length + 3)) * 100)}% coverage)`,
  );
  console.log('');
  console.log('🎬 Movies demonstrating new create/update approach:');
  console.log('  ✅ Inception (5 actors) - created with actors');
  console.log('  ✅ The Dark Knight (2 actors) - created with actors');
  console.log('  ✅ The Shawshank Redemption (2 actors) - created with actors');
  console.log('  ✅ Titanic (2 actors) - created with actors');
  console.log('  ✅ The Silence of the Lambs (2 actors) - created with actors');
  console.log('  ✅ Test Movie (1 actor) - created with actors');
  console.log(
    '  ✅ Example Movie with Multiple Actors (4 actors) - created with actors',
  );
  console.log('  ✅ Movie Without Actors (0 actors) - created without actors');
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
