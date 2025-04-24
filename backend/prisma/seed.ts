// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Seeding database...");

  // 1) Wipe existing data (in correct order for referential integrity)
  await prisma.review.deleteMany();
  await prisma.game.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create demo users with hashed password
  console.log("👥 Creating users...");
  const passwordHash = await bcrypt.hash("password", 10);
  const [gamer, rpgFan, ylandsEdu, admin] = await Promise.all([
    prisma.user.create({
      data: {
        username: "gamer123",
        email: "gamer@example.com",
        passwordHash,
        role: "user",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamer123"
      },
    }),
    prisma.user.create({
      data: {
        username: "rpgfan",
        email: "rpg@example.com",
        passwordHash,
        role: "user",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rpgfan"
      },
    }),
    prisma.user.create({
      data: {
        username: "ylands_edu",
        email: "ylands@example.com",
        passwordHash,
        role: "user",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ylands_edu"
      },
    }),
    prisma.user.create({
      data: {
        username: "admin",
        email: "admin@example.com",
        passwordHash,
        role: "admin",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
      },
    }),
  ]);
  console.log(
    "✔️ Created users:",
    [gamer.username, rpgFan.username, ylandsEdu.username, admin.username].join(
      ", "
    )
  );

  // 3) Create a company
  console.log("🏢 Creating company...");
  const bohemia = await prisma.company.create({
    data: {
      name: "Bohemia Interactive",
      description:
        "Czech studio specializing in military and sandbox simulations, creator of the Operation Flashpoint and Arma series, DayZ, and more.",
      foundedYear: 1999,
      website: "https://www.bohemia.net/",
      logo: "https://www.bohemia.net/assets/img/bohemia-interactive-logo.svg",
    },
  });
  console.log("✔️ Created company:", bohemia.name);

  // 5) Create games
  console.log("🎮 Creating games...");
  const gamesData = [
    {
      title: "Operation Flashpoint: Cold War Crisis",
      genre: "Shooter",
      description:
        "A 2001 tactical shooter set in 1985, featuring sprawling island environments, realistic combined-arms warfare, mission editor, and both solo and LAN/online multiplayer modes.",
      releaseDate: new Date("2001-06-21"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/65790/header.jpg",
      averageRating: 4.6,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "Operation Flashpoint: Resistance",
      genre: "Shooter",
      description:
        "The 2002 standalone expansion prequel, commanding a guerrilla insurgency on the island of Nogova with enhanced graphics, new weapons, and refined multiplayer mechanics.",
      releaseDate: new Date("2002-06-28"),
      coverImage:
        "https://www.mobygames.com/images/covers/l/64042-operation-flashpoint-resistance-windows-front-cover.jpg",
      averageRating: 4.5,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "Operation Flashpoint: Elite",
      genre: "Shooter",
      description:
        "Xbox exclusive 2005 remake bundling Cold War Crisis and Resistance, featuring Xbox Live multiplayer and refined controls for console play.",
      releaseDate: new Date("2005-11-09"),
      coverImage:
        "https://www.mobygames.com/images/covers/l/24184-operation-flashpoint-elite-xbox-front-cover.jpg",
      averageRating: 4.2,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "ArmA: Armed Assault",
      genre: "Shooter",
      description:
        "2006 spiritual successor set on Croatian islands, introducing Real Virtuality engine enhancements, scripting, and open-ended combat scenarios.",
      releaseDate: new Date("2006-11-10"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/33930/header.jpg",
      averageRating: 4.3,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "ArmA: Queen's Gambit",
      genre: "Shooter",
      description:
        "2007 standalone expansion on Everon, adding new missions, vehicles, and scripting for enhanced single-player campaigns.",
      releaseDate: new Date("2007-09-28"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/33940/header.jpg",
      averageRating: 4.1,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "ArmA 2",
      genre: "Shooter",
      description:
        "2009 modern‑era military sim on Chernarus, praised for realism and spawning the DayZ mod phenomenon.",
      releaseDate: new Date("2009-06-18"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/33900/header.jpg",
      averageRating: 4.7,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "ArmA 3",
      genre: "Shooter",
      description:
        "2013 open‑world sandbox on Altis & Stratis with Eden editor, full mod support, and advanced vehicle and infantry combat.",
      releaseDate: new Date("2013-09-12"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/107410/header.jpg",
      averageRating: 4.8,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "Take On Helicopters",
      genre: "Simulation",
      description:
        "2011 civilian flight sim in Seattle airspace, featuring career mode, realistic helicopter physics, and a large open‑world environment.",
      releaseDate: new Date("2011-10-27"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/107380/header.jpg",
      averageRating: 4.0,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "Carrier Command: Gaea Mission",
      genre: "Strategy",
      description:
        "2012 naval RTS/sim on an archipelago, combining strategic resource management with tactical vehicle combat.",
      releaseDate: new Date("2012-09-28"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/222140/header.jpg",
      averageRating: 3.9,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "ARMA Tactics",
      genre: "Strategy",
      description:
        "2013 turn‑based tactical spin‑off built in Unity, blending card-based mechanics with the ArmA universe.",
      releaseDate: new Date("2013-10-01"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/346820/header.jpg",
      averageRating: 3.8,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "Take On Mars",
      genre: "Simulation",
      description:
        "2013 Mars exploration sim with realistic physics, rover piloting, and resource-harvesting career mode.",
      releaseDate: new Date("2013-08-01"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/282070/header.jpg",
      averageRating: 4.0,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "DayZ (Standalone)",
      genre: "Survival",
      description:
        "2018 open‑world zombie survival spin‑off from ARMA 2 mod, featuring hardcore permadeath and persistent online world.",
      releaseDate: new Date("2018-12-13"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/221100/header.jpg",
      averageRating: 4.2,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "Vigor",
      genre: "Shooter",
      description:
        "2019 free‑to‑play looter‑shooter with base-building Shelter, crafting, timed Encounters, and cross‑platform progression.",
      releaseDate: new Date("2019-08-19"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/2818260/header.jpg",
      averageRating: 4.1,
      reviewCount: 0,
      status: "APPROVED"
    },
    {
      title: "Ylands",
      genre: "Sandbox",
      description:
        "2019 low‑poly adventure/survival sandbox focusing on exploration, crafting, building, and community scenarios.",
      releaseDate: new Date("2019-12-05"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/298610/header.jpg",
      averageRating: 4.7,
      reviewCount: 1,
      status: "APPROVED"
    },
    {
      title: "Ylands Education",
      genre: "Educational",
      description:
        "2020 classroom‑focused version of Ylands with guided STEM lessons, coding tasks, and collaborative project templates.",
      releaseDate: new Date("2020-09-15"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/298610/header.jpg",
      averageRating: 4.9,
      reviewCount: 1,
      status: "APPROVED"
    },
    {
      title: "ARMA Reforger",
      genre: "Shooter",
      description:
        "2023 Enfusion-engine multiplayer sandbox on Everon, showcasing next‑gen mod tools and live service updates.",
      releaseDate: new Date("2023-11-16"),
      coverImage:
        "https://cdn.akamai.steamstatic.com/steam/apps/1874880/header.jpg",
      averageRating: 4.3,
      reviewCount: 0,
      status: "APPROVED"
    },
  ];
  
  const createdGames = await Promise.all(
    gamesData.map(gameData => {
      const { releaseDate, ...restData } = gameData;
      return prisma.game.create({ 
        data: {
          ...restData,
          releaseDate: releaseDate,
          companyId: bohemia.id,
          createdById: admin.id,
        }
      });
    })
  );
  console.log(`✔️ Games: ${createdGames.length} games created`);

  // Find games for reviews
  const ylandsGame = createdGames.find(g => g.title === "Ylands");
  const ylandsEduGame = createdGames.find(g => g.title === "Ylands Education");
  
  if (ylandsGame && ylandsEduGame) {
    // 6) Create reviews
    console.log("📝 Creating reviews...");
    const reviewsData = [
      {
        gameId: ylandsGame.id,
        userId: ylandsEdu.id,
        rating: 5,
        comment:
          "A fantastic sandbox game offering creative freedom & beautiful islands.",
        status: "APPROVED",
        createdAt: new Date("2022-06-10T14:25:00Z"),
      },
      {
        gameId: ylandsEduGame.id,
        userId: ylandsEdu.id,
        rating: 5,
        comment:
          "As an educational tool, Ylands Education makes STEM learning engaging.",
        status: "APPROVED",
        createdAt: new Date("2022-06-15T09:30:00Z"),
      },
    ];
    
    const createdReviews = await Promise.all(
      reviewsData.map(r => {
        const { createdAt, ...restData } = r;
        return prisma.review.create({
          data: {
            ...restData,
            createdAt: createdAt,
          },
        });
      })
    );
    console.log("✔️ Created reviews:", createdReviews.length);
  } else {
    console.log("⚠️ Could not find Ylands games for creating reviews");
  }

  console.log("🎉 Seeding finished!");
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error("❌ Seed error:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}