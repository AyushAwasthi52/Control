import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Operation Free Controller database...");

  // 1. Create or update UserProfile
  await prisma.userProfile.upsert({
    where: { id: "default-user" },
    update: {},
    create: {
      id: "default-user",
      displayName: "Ayush",
      country: "India",
      genuineBackground: "Computer Science student and competitive PC gamer passionate about gaming peripherals, input latency, and controller switch mechanics.",
      interests: "Wireless controllers, Hall-effect joysticks, microswitch face buttons, low-latency esports mice",
      portfolioLinks: JSON.stringify([
        { label: "GitHub", url: "https://github.com" },
        { label: "Tech & Peripheral Review Notes", url: "https://ayush-peripherals.notion.site" }
      ]),
      approvedSignature: "Best regards,\nAyush\nB.Tech Computer Science | Peripheral Testing Enthusiast\nIndia",
    },
  });

  // 2. Initial Peripheral Companies
  const companiesData = [
    {
      name: "8BitDo",
      normalizedName: "8bitdo",
      website: "https://www.8bitdo.com",
      normalizedDomain: "8bitdo.com",
      country: "Hong Kong",
      categories: JSON.stringify(["Controllers", "Adapters", "Arcade Sticks"]),
      description: "Pioneer in premier retro-modern game controllers, Hall Effect sticks, and multi-platform wireless gamepads.",
      status: "CONTACT_FOUND",
      contacts: [
        {
          email: "support@8bitdo.com",
          normalizedEmail: "support@8bitdo.com",
          contactType: "PARTNERSHIPS",
          sourceUrl: "https://www.8bitdo.com/contact/",
          sourceCheckedAt: new Date(),
          verificationStatus: "VERIFIED",
          notes: "Official public contact page for press and partnership queries."
        }
      ],
      research: {
        sourceUrl: "https://www.8bitdo.com/ultimate-bluetooth-controller/",
        sourceType: "OFFICIAL_WEBSITE",
        facts: JSON.stringify({
          keyProducts: ["Ultimate 2.4G Wireless Controller", "Pro 2 Bluetooth Gamepad", "Retro Mechanical Keyboard"],
          innovations: ["Hall Effect sensing joysticks", "Custom button mapping software", "Charging dock integration"],
          regions: ["Worldwide", "Asia", "North America", "Europe"]
        }),
        confidence: "VERIFIED"
      }
    },
    {
      name: "Flydigi",
      normalizedName: "flydigi",
      website: "https://www.flydigi.com",
      normalizedDomain: "flydigi.com",
      country: "China",
      categories: JSON.stringify(["Controllers", "Mobile Gaming", "Keyboards"]),
      description: "Innovator in high-precision esports controllers featuring force feedback triggers and hybrid D-pads.",
      status: "CONTACT_FOUND",
      contacts: [
        {
          email: "marketing@flydigi.com",
          normalizedEmail: "marketing@flydigi.com",
          contactType: "PR",
          sourceUrl: "https://en.flydigi.com/index/contact",
          sourceCheckedAt: new Date(),
          verificationStatus: "VERIFIED",
          notes: "Official brand business & media cooperation inbox."
        }
      ],
      research: {
        sourceUrl: "https://en.flydigi.com/vader4pro",
        sourceType: "OFFICIAL_WEBSITE",
        facts: JSON.stringify({
          keyProducts: ["Vader 4 Pro", "Apex 4 Elite", "Direwolf 2"],
          innovations: ["Adjustable alloy tension sticks", "Force feedback triggers", "1000Hz polling rate wireless"],
          regions: ["Global", "APAC", "North America"]
        }),
        confidence: "VERIFIED"
      }
    },
    {
      name: "GuliKit",
      normalizedName: "gulikit",
      website: "https://www.gulikit.com",
      normalizedDomain: "gulikit.com",
      country: "China",
      categories: JSON.stringify(["Controllers", "Joy-Con Modules", "Accessories"]),
      description: "Original developer of patented electromagnetic Hall effect joystick modules and KingKong controller line.",
      status: "CONTACT_FOUND",
      contacts: [
        {
          email: "contact@gulikit.com",
          normalizedEmail: "contact@gulikit.com",
          contactType: "PARTNERSHIPS",
          sourceUrl: "https://www.gulikit.com/about.html",
          sourceCheckedAt: new Date(),
          verificationStatus: "VERIFIED",
          notes: "Direct contact for brand cooperation and product inquiries."
        }
      ],
      research: {
        sourceUrl: "https://www.gulikit.com/productinfo/1130420.html",
        sourceType: "OFFICIAL_WEBSITE",
        facts: JSON.stringify({
          keyProducts: ["KingKong 3 Max Controller", "KK2 Pro", "TMR Electromagnetic Replacement Sticks"],
          innovations: ["Patented Hall sensing stick mechanisms", "Smart auto-pilot gaming recording", "Mechanical tactile buttons"],
          regions: ["Global"]
        }),
        confidence: "VERIFIED"
      }
    },
    {
      name: "GameSir",
      normalizedName: "gamesir",
      website: "https://www.gamesir.hk",
      normalizedDomain: "gamesir.hk",
      country: "Hong Kong",
      categories: JSON.stringify(["Controllers", "Mobile Controllers", "Keyboards"]),
      description: "Popular manufacturer of affordable high-performance wired and wireless controllers with Hall effect sticks and clicky switches.",
      status: "CONTACT_FOUND",
      contacts: [
        {
          email: "influencer@gamesir.hk",
          normalizedEmail: "influencer@gamesir.hk",
          contactType: "PR",
          sourceUrl: "https://www.gamesir.hk/pages/influencer-program",
          sourceCheckedAt: new Date(),
          verificationStatus: "VERIFIED",
          notes: "Dedicated influencer and product review cooperation desk."
        }
      ],
      research: {
        sourceUrl: "https://www.gamesir.hk/products/gamesir-g7-se",
        sourceType: "OFFICIAL_WEBSITE",
        facts: JSON.stringify({
          keyProducts: ["GameSir G7 SE (Officially licensed for Xbox)", "Kaleid & Kaleid Flux", "Nova Lite Wireless"],
          innovations: ["Anti-drift Hall Effect sticks", "Quick-latch back buttons", "Magnetic swappable faceplates"],
          regions: ["Worldwide"]
        }),
        confidence: "VERIFIED"
      }
    },
    {
      name: "Pulsar Gaming Gears",
      normalizedName: "pulsargaminggears",
      website: "https://www.pulsar.gg",
      normalizedDomain: "pulsar.gg",
      country: "South Korea",
      categories: JSON.stringify(["Gaming Mice", "Mousepads", "Keyboards"]),
      description: "Esports-focused peripheral engineering company celebrated for X2 ultra-light wireless mice and Superglide glass skates.",
      status: "RESEARCHED",
      contacts: [
        {
          email: "support@pulsargg.freshdesk.com",
          normalizedEmail: "support@pulsargg.freshdesk.com",
          contactType: "SUPPORT",
          sourceUrl: "https://www.pulsar.gg/pages/contact-us",
          sourceCheckedAt: new Date(),
          verificationStatus: "UNVERIFIED",
          notes: "Official brand support portal. Dedicated PR contact pending."
        }
      ],
      research: {
        sourceUrl: "https://www.pulsar.gg/products/x2-v2-wireless-gaming-mouse",
        sourceType: "OFFICIAL_WEBSITE",
        facts: JSON.stringify({
          keyProducts: ["X2V2 Wireless", "Xlite V3 Ergonomic", "Superglide 2 Glass Mousepad"],
          innovations: ["Optical switches", "Sub-55g ultra-light chassis without honeycomb holes", "4K/8K polling compatibility"],
          regions: ["Global", "Korea", "North America", "Europe"]
        }),
        confidence: "VERIFIED"
      }
    }
  ];

  for (const c of companiesData) {
    const company = await prisma.company.upsert({
      where: { id: `seed-${c.normalizedName}` },
      update: {},
      create: {
        id: `seed-${c.normalizedName}`,
        name: c.name,
        normalizedName: c.normalizedName,
        website: c.website,
        normalizedDomain: c.normalizedDomain,
        country: c.country,
        categories: c.categories,
        description: c.description,
        status: c.status,
        contacts: {
          create: c.contacts.map((contact) => ({
            email: contact.email,
            normalizedEmail: contact.normalizedEmail,
            contactType: contact.contactType,
            sourceUrl: contact.sourceUrl,
            sourceCheckedAt: contact.sourceCheckedAt,
            verificationStatus: contact.verificationStatus,
            notes: contact.notes,
          })),
        },
        researchRecords: {
          create: {
            sourceUrl: c.research.sourceUrl,
            sourceType: c.research.sourceType,
            facts: c.research.facts,
            confidence: c.research.confidence,
          },
        },
      },
      include: {
        contacts: true,
      },
    });

    // Create a sample draft in NEEDS_REVIEW for 8BitDo
    if (c.normalizedName === "8bitdo" && company.contacts.length > 0) {
      await prisma.emailDraft.upsert({
        where: { id: "seed-draft-8bitdo" },
        update: {},
        create: {
          id: "seed-draft-8bitdo",
          companyId: company.id,
          contactId: company.contacts[0].id,
          subject: "Product-sampling inquiry — 8BitDo Hall Effect Controllers & Accessories",
          body: `Hello 8BitDo Team,\n\nI am a Computer Science student and PC gamer in India, and I'm reaching out to inquire whether your team offers product-sampling or community testing opportunities for individual gamers.\n\nI have followed 8BitDo's advancements with interest, particularly your integration of anti-drift Hall Effect joysticks and charging docks on the Ultimate 2.4G and Pro 2 wireless controllers. As an active gamer with a technical focus on input latency and hardware durability, I would welcome the opportunity to test one of your controllers and provide detailed, honest feedback.\n\nI understand sampling units may not be available for every request, but I would appreciate knowing if your team maintains a creator/tester review queue or formal application process.\n\nThank you for your time and continued dedication to peripheral innovation.\n\nBest regards,\nAyush\nB.Tech Computer Science | Peripheral Testing Enthusiast\nIndia`,
          status: "NEEDS_REVIEW",
          version: 1,
        },
      });
    }
  }

  // Initial suppression test entry
  await prisma.suppression.upsert({
    where: { id: "seed-suppression-test" },
    update: {},
    create: {
      id: "seed-suppression-test",
      normalizedEmail: "optout-example@competitor.com",
      normalizedDomain: "spammybrand.xyz",
      reason: "Requested opt-out from outreach",
      source: "USER_OPT_OUT",
    },
  });

  // Log initial activity
  await prisma.activityLog.create({
    data: {
      actor: "system",
      action: "DATABASE_INITIALIZED",
      entityType: "SYSTEM",
      entityId: "init",
      metadata: JSON.stringify({ seededCompanies: companiesData.length }),
    },
  });

  console.log("Seeding complete! 5 gaming brands, verified contacts, and sample draft ready.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
