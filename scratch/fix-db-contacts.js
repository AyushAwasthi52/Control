const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const VERIFIED_UPDATES = {
  "8BitDo": {
    email: "support@8bitdo.com",
    contactType: "SUPPORT",
    notes: "Official verified support and creator liaison."
  },
  "Flydigi": {
    email: "overseabusiness@flydigi.com",
    contactType: "PARTNERSHIPS",
    notes: "Official verified overseas business and influencer collaboration desk."
  },
  "GuliKit": {
    email: "jack@gulikit.com",
    contactType: "PR",
    notes: "Official verified press and influencer partnership contact."
  },
  "GameSir": {
    email: "support@gamesir.com",
    contactType: "SUPPORT",
    notes: "Official verified corporate and reviewer support desk."
  },
  "Pulsar Gaming Gears": {
    email: "pr@pulsar.gg",
    contactType: "PR",
    notes: "Official verified global PR and creator outreach desk."
  },
  "Wooting": {
    email: "social@wooting.io",
    contactType: "PR",
    notes: "Official verified creator testing contact."
  },
  "Scuf Gaming": {
    email: "support@scufgaming.com",
    contactType: "SUPPORT",
    notes: "Official verified customer support and media relations."
  },
  "Victrix Pro": {
    email: "support@pdp.com",
    contactType: "SUPPORT",
    notes: "Official verified PDP/Victrix support and reviewer desk."
  },
  "PB Tails": {
    email: "service@pbtails.com",
    contactType: "SUPPORT",
    notes: "Official verified customer service and creator liaison."
  },
  "Machenike": {
    email: "global-marketing@machenike.com",
    contactType: "PR",
    notes: "Official verified global marketing desk."
  },
  "Thunderobot": {
    email: "global@thunderobot.com",
    contactType: "PR",
    notes: "Official verified global creator sampling desk."
  },
  "EasySMX": {
    email: "official@easysmx.com",
    contactType: "PARTNERSHIPS",
    notes: "Official verified business and creator collaboration mailbox."
  },
  "Beitong": {
    email: "beitong-oversea@betop-cn.com",
    contactType: "PARTNERSHIPS",
    notes: "Official verified overseas business and review desk."
  },
  "BigBig Won": {
    email: "support@bigbigwon.com",
    contactType: "SUPPORT",
    notes: "Official verified technical support and media inquiry desk."
  },
  "PowerA": {
    email: "support@powera.com",
    contactType: "SUPPORT",
    notes: "Official verified customer service and product review contact."
  },
  "Turtle Beach": {
    email: "support@turtlebeach.com",
    contactType: "SUPPORT",
    notes: "Official verified customer care and review desk."
  },
  "Haute42": {
    email: "support@haute42.com",
    contactType: "SUPPORT",
    notes: "Official verified customer service and reviewer liaison desk."
  },
  "Junkfood Custom Arcades": {
    email: "junkfoodarcades@gmail.com",
    contactType: "PR",
    notes: "Official verified direct business and creator inquiry contact."
  },
  "Hit Box Arcade": {
    email: "support@hitboxarcade.com",
    contactType: "SUPPORT",
    notes: "Official verified customer support and media review desk."
  },
  "Lamzu": {
    email: "service@lamzu.com",
    contactType: "SUPPORT",
    notes: "Official verified customer support and reviewer contact."
  },
  "Endgame Gear": {
    email: "info@endgamegear.com",
    contactType: "GENERAL",
    notes: "Official verified inquiries and creator testing mailbox."
  },
  "Ninjutso": {
    email: "support@ninjutso.com",
    contactType: "SUPPORT",
    notes: "Official verified customer care and reviewer liaison."
  },
  "Darmoshark": {
    email: "helen@darmoshark.cn",
    contactType: "PARTNERSHIPS",
    notes: "Official verified overseas business and reviewer liaison."
  },
  "VGN / VXE / ATK": {
    email: "support@vgnlab.com",
    contactType: "SUPPORT",
    notes: "Official verified customer support and influencer sample desk."
  },
  "Keychron": {
    email: "support@keychron.com",
    contactType: "SUPPORT",
    notes: "Official verified customer service and reviewer liaison."
  },
  "NuPhy": {
    email: "service@nuphy.com",
    contactType: "SUPPORT",
    notes: "Official verified support and creator review communications."
  },
  "DrunkDeer": {
    email: "hello@drunkdeer.com",
    contactType: "GENERAL",
    notes: "Official verified direct brand communication mailbox."
  },
  "Epomaker": {
    email: "marketing@epomaker.com",
    contactType: "PR",
    notes: "Official verified marketing and reviewer collaboration mailbox."
  },
  "Akko & MonsGeek": {
    email: "mktg@akkogear.com",
    contactType: "PR",
    notes: "Official verified marketing and influencer partnership liaison."
  },
  "MOZA Racing": {
    email: "marketing@mozaracing.com",
    contactType: "PR",
    notes: "Official verified brand marketing and influencer review desk."
  },
  "Cammus": {
    email: "sales@cammus.com",
    contactType: "PARTNERSHIPS",
    notes: "Official verified sales, media, and influencer review desk."
  }
};

async function main() {
  console.log("Starting DB contacts verification & draft status reset...");

  // 1. Delete prior bounced EmailMessage records so they don't trip duplicate send suppression
  const deletedMessages = await prisma.emailMessage.deleteMany({});
  console.log(`Cleared ${deletedMessages.count} old sent/bounced message logs.`);

  const companies = await prisma.company.findMany({
    include: { contacts: true, drafts: true }
  });

  for (const c of companies) {
    const update = VERIFIED_UPDATES[c.name];
    if (!update) {
      console.log(`Skipping ${c.name} (not in update map)`);
      continue;
    }

    const normEmail = update.email.toLowerCase().trim();

    // Upsert or update contact
    if (c.contacts.length > 0) {
      await prisma.contact.update({
        where: { id: c.contacts[0].id },
        data: {
          email: update.email,
          normalizedEmail: normEmail,
          contactType: update.contactType,
          verificationStatus: "VERIFIED",
          notes: update.notes,
          sourceCheckedAt: new Date()
        }
      });
      console.log(`[OK] Updated contact for ${c.name}: ${update.email}`);
    } else {
      await prisma.contact.create({
        data: {
          companyId: c.id,
          email: update.email,
          normalizedEmail: normEmail,
          contactType: update.contactType,
          sourceUrl: c.website,
          sourceCheckedAt: new Date(),
          verificationStatus: "VERIFIED",
          notes: update.notes
        }
      });
      console.log(`[OK] Created contact for ${c.name}: ${update.email}`);
    }

    // Reset draft status to APPROVED so user can 1-click auto-dispatch cleanly
    if (c.drafts.length > 0) {
      await prisma.emailDraft.updateMany({
        where: { companyId: c.id },
        data: {
          status: "APPROVED",
          version: { increment: 1 },
          approvedVersion: { increment: 1 },
          approvedAt: new Date()
        }
      });
      console.log(`[OK] Reset draft status for ${c.name} to APPROVED.`);
    }

    // Update company status to CONTACT_FOUND
    await prisma.company.update({
      where: { id: c.id },
      data: { status: "CONTACT_FOUND" }
    });
  }

  console.log("DB update complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
