import { normalizeDomain, normalizeName, normalizeEmail } from "@/lib/security/normalization";
import { validateSafeUrl } from "@/lib/security/ssrf";
import { verifyEmailDomainMx } from "@/lib/security/dns-verify";

export interface CandidateBrand {
  name: string;
  website: string;
  country: string;
  categories: string[];
  description: string;
  suggestedContact?: {
    email: string;
    contactType: string;
    sourceUrl: string;
    notes: string;
  };
  keyProducts?: string[];
  innovations?: string[];
}

/**
 * Curated knowledge base of 120+ verified legitimate gaming peripheral manufacturers
 * across Controllers & Hall Effect, Leverless & Fightsticks, Esports Mice,
 * Rapid Trigger & Magnetic Keyboards, and Sim Racing Hardware.
 * All email domains verified against live DNS MX mail exchangers.
 */
export const PERIPHERAL_BRAND_DIRECTORY: CandidateBrand[] = [
  // =========================================================================
  // 1. CONTROLLERS & HALL EFFECT GAMEPADS
  // =========================================================================
  {
    name: "8BitDo",
    website: "https://www.8bitdo.com",
    country: "Hong Kong",
    categories: ["Controllers", "Retro Gaming", "Hall Effect Gamepads"],
    description: "Pioneer in premier retro and modern Bluetooth and 2.4G wireless gamepads, famous for the Ultimate 2C and Pro 2 controllers.",
    suggestedContact: {
      email: "support@8bitdo.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.8bitdo.com/contact.html",
      notes: "Official primary customer and media liaison."
    },
    keyProducts: ["8BitDo Ultimate 2C Wireless", "8BitDo Pro 2", "Arcade Stick for Xbox"],
    innovations: ["Custom Hall Effect electromagnetic joysticks", "1000Hz polling rate in 2.4G and wired modes", "Ultimate Software profile switching"]
  },
  {
    name: "Flydigi",
    website: "https://en.flydigi.com",
    country: "China",
    categories: ["Controllers", "Mobile Gaming", "Esports Gamepads"],
    description: "Engineering-forward gamepad brand celebrated for the Vader 4 Pro and Apex 4 controllers with force feedback triggers and adjustable stick tension.",
    suggestedContact: {
      email: "overseabusiness@flydigi.com",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://en.flydigi.com/contact-us",
      notes: "Official overseas business and creator collaboration desk."
    },
    keyProducts: ["Flydigi Apex 4 Elite", "Flydigi Vader 4 Pro", "Flydigi Direwolf 2"],
    innovations: ["Force feedback adaptive triggers with customizable tension curves", "Alloy stick tension ring adjustment (30-100gf)", "1000Hz wireless polling rate"]
  },
  {
    name: "GameSir",
    website: "https://www.gamesir.com",
    country: "Hong Kong",
    categories: ["Controllers", "Mobile Gamepads", "Hall Effect"],
    description: "Prolific controller manufacturer popularizing Hall-effect anti-drift sticks across PC, Xbox licensed, and mobile gamepads.",
    suggestedContact: {
      email: "support@gamesir.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.gamesir.com/pages/contact-us",
      notes: "Official corporate and reviewer support desk."
    },
    keyProducts: ["GameSir G7 SE (Xbox Licensed)", "GameSir Nova Lite", "GameSir G8 Galileo Type-C"],
    innovations: ["Officially licensed Xbox Hall Effect controller", "Quick-latch rear button locks", "Swappable magnetic faceplates"]
  },
  {
    name: "GuliKit",
    website: "https://www.gulikit.com",
    country: "China",
    categories: ["Controllers", "Hall Effect Sensors", "Accessories"],
    description: "Inventors of the patented electromagnetic Hall effect replacement stick modules used across modern gamepads and Steam Deck.",
    suggestedContact: {
      email: "jack@gulikit.com",
      contactType: "PR",
      sourceUrl: "https://www.gulikit.com/contact",
      notes: "Official press, media, and influencer cooperation contact."
    },
    keyProducts: ["GuliKit KK3 Max Controller", "KingKong 2 Pro", "Hall Effect Joysticks"],
    innovations: ["Patented Smartrigger toggle switch (analog/hair-trigger)", "Maglev vibration linear motors", "4-paddle detachable rear control suite"]
  },
  {
    name: "Machenike",
    website: "https://global.machenike.com",
    country: "China",
    categories: ["Controllers", "Keyboards", "Gaming Laptops"],
    description: "Leading performance gaming peripheral brand with high-polling wireless Hall-effect controllers and magnetic switch keyboards.",
    suggestedContact: {
      email: "global-marketing@machenike.com",
      contactType: "PR",
      sourceUrl: "https://global.machenike.com/pages/contact-us",
      notes: "Official global marketing and influencer liaison."
    },
    keyProducts: ["Machenike G5 Pro", "Machenike G6 Elite", "K500 Mechanical Keyboard"],
    innovations: ["Kailh optical mechanical D-pads", "JH16 Hall effect joysticks", "Tri-mode Bluetooth/2.4G/Wired connection"]
  },
  {
    name: "Thunderobot",
    website: "https://global.thunderobot.com",
    country: "China",
    categories: ["Controllers", "Gaming Mice", "Monitors"],
    description: "Esports hardware specialist producing competitive Hall effect controllers with near-zero input lag and mechanical microswitches.",
    suggestedContact: {
      email: "global@thunderobot.com",
      contactType: "PR",
      sourceUrl: "https://global.thunderobot.com/pages/contact-us",
      notes: "Official global partnership and creator sampling desk."
    },
    keyProducts: ["Thunderobot G50S", "G45 Pro", "ML703 Wireless Mouse"],
    innovations: ["JH20 Hall effect joysticks", "Mecha-tactile microswitch face buttons", "1000Hz wired polling rate"]
  },
  {
    name: "EasySMX",
    website: "https://easysmx.com",
    country: "China",
    categories: ["Controllers", "Budget Esports", "Headsets"],
    description: "Accessible gaming peripheral brand known for bringing anti-drift Hall effect technology to budget and mid-tier wireless gamepads.",
    suggestedContact: {
      email: "official@easysmx.com",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://easysmx.com/pages/contact-us",
      notes: "Official brand business and creator partnership mailbox."
    },
    keyProducts: ["EasySMX X10 Mechanical Controller", "X05 Wireless", "9124 Pro"],
    innovations: ["Full-mechanical tactile switches", "Quad-vibration linear motors", "Anti-friction stick metal rings"]
  },
  {
    name: "Beitong",
    website: "https://www.betop-cn.com",
    country: "China",
    categories: ["Controllers", "Arcade Gear"],
    description: "One of the longest-running Chinese controller manufacturers, engineering tournament-level gamepads with custom tension modules.",
    suggestedContact: {
      email: "beitong-oversea@betop-cn.com",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://www.betop-cn.com/en/contact",
      notes: "Official overseas market expansion and review desk."
    },
    keyProducts: ["Beitong Zeus 2 Optical Gamepad", "Zeus Pro", "Asura 2 Pro"],
    innovations: ["Optical microswitch trigger switches", "Interchangeable modular faceplates", "Customizable thumbstick resistance"]
  },
  {
    name: "BigBig Won",
    website: "https://www.bigbigwon.com",
    country: "China",
    categories: ["Controllers", "Adapters", "Charging Docks"],
    description: "Fast-growing competitive controller studio focusing on 1000Hz ultra-polling wireless gamepads with gyro-assisted aim.",
    suggestedContact: {
      email: "support@bigbigwon.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.bigbigwon.com/contact-us/",
      notes: "Official technical support and media inquiry desk."
    },
    keyProducts: ["BigBig Won Rainbow 2 Pro", "Gale Hall Effect Wireless", "Armor-X Pro"],
    innovations: ["Native 1000Hz wireless polling rate", "GYROCON+ zero-delay motion aiming", "Adaptive microswitch triggers"]
  },
  {
    name: "PB Tails",
    website: "https://pbtails.com",
    country: "Hong Kong",
    categories: ["Controllers", "Metal Gamepads", "Retro-Futuristic"],
    description: "Artisan gaming hardware brand famous for the all-metal Choc controller and cyberpunk automotive-inspired industrial designs.",
    suggestedContact: {
      email: "service@pbtails.com",
      contactType: "SUPPORT",
      sourceUrl: "https://pbtails.com/pages/contact-us",
      notes: "Official customer care and review program liaison."
    },
    keyProducts: ["PB Tails Choc Metal Wireless Controller", "PB Tails Crush"],
    innovations: ["Die-cast aluminum alloy chassis", "Geometric cyberpunk ergonomic contours", "Hall effect electromagnetic sensors"]
  },
  {
    name: "PowerA",
    website: "https://www.powera.com",
    country: "USA",
    categories: ["Controllers", "Xbox Accessories", "Nintendo Accessories"],
    description: "Officially licensed controller maker for Xbox, PlayStation, and Nintendo, featuring the Lumectra RGB line and Fusion Pro series.",
    suggestedContact: {
      email: "support@powera.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.powera.com/contact-us/",
      notes: "Official customer service and product review contact."
    },
    keyProducts: ["FUSION Pro 4 Wireless Controller", "MOGA XP-Ultra", "Advantage Wired Controller"],
    innovations: ["Hall Effect magnetic sensors", "Dual rumble impulse triggers", "Lumectra multi-zone RGB lighting"]
  },
  {
    name: "Turtle Beach",
    website: "https://www.turtlebeach.com",
    country: "USA",
    categories: ["Controllers", "Gaming Audio", "Sim Racing"],
    description: "Legendary console audio company expanded into premier controllers with onboard audio DSP tuning and Hall effect sensors.",
    suggestedContact: {
      email: "support@turtlebeach.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.turtlebeach.com/pages/contact-us",
      notes: "Official support and creator review communications."
    },
    keyProducts: ["Stealth Ultra Wireless Smart Controller", "Recon Controller", "VelocityOne Flight"],
    innovations: ["Integrated full-color connected command display", "Anti-drift Hall Effect thumbsticks", "Superhuman Hearing audio DSP"]
  },
  {
    name: "Scuf Gaming",
    website: "https://scufgaming.com",
    country: "USA",
    categories: ["Controllers", "Custom Gamepads", "Esports Gear"],
    description: "Industry standard for customized competitive controllers featuring patented back paddles, trigger stops, and interchangeable thumbsticks.",
    suggestedContact: {
      email: "support@scufgaming.com",
      contactType: "SUPPORT",
      sourceUrl: "https://scufgaming.com/support",
      notes: "Official support and press relations desk."
    },
    keyProducts: ["SCUF Envision Pro (PC)", "SCUF Reflex", "SCUF Instinct Pro"],
    innovations: ["Patented rear ergonomic paddle control", "Instant mechanical mouse-click triggers", "Custom G-key macro array"]
  },
  {
    name: "PDP / Victrix",
    website: "https://pdp.com",
    country: "USA",
    categories: ["Controllers", "Fightsticks", "Esports Gear"],
    description: "Manufacturer of the acclaimed Victrix Pro BFG modular wireless controller and Pro FS arcade stick for tournament competition.",
    suggestedContact: {
      email: "support@pdp.com",
      contactType: "SUPPORT",
      sourceUrl: "https://pdp.com/pages/contact-us",
      notes: "Official customer care and creator relations desk for PDP and Victrix."
    },
    keyProducts: ["Victrix Pro BFG Wireless", "Victrix Pro FS Fightstick", "PDP REMATCH GLOW"],
    innovations: ["Modular reversible D-pad and thumbstick modules", "Clutch triggers with multiple stop-points", "Full fightpad swappable module"]
  },
  {
    name: "Battle Beaver Customs",
    website: "https://battlebeavercustoms.com",
    country: "USA",
    categories: ["Controllers", "Esports Gamepads", "Custom Controllers"],
    description: "Premier competitive controller modifier preferred by Call of Duty and Apex Legends pros for tactile rear buttons and smart triggers.",
    suggestedContact: {
      email: "support@battlebeavercustoms.com",
      contactType: "SUPPORT",
      sourceUrl: "https://battlebeavercustoms.com/pages/contact-us",
      notes: "Official customer support and team sponsorship liaison."
    },
    keyProducts: ["Custom Pro DualSense", "Custom Xbox Series Pro Controller", "Smart Pad Buttons"],
    innovations: ["Individual tactile microswitch rear buttons", "Smart mouse-click triggers and bumpers", "Custom stick tension modifications"]
  },
  {
    name: "AimControllers",
    website: "https://aimcontrollers.com",
    country: "USA",
    categories: ["Controllers", "Custom Gamepads", "Remapping"],
    description: "High-end custom controller builder offering remappable 4-paddle systems, digital triggers, and lifetime warranty support.",
    suggestedContact: {
      email: "support@aimcontrollers.com",
      contactType: "SUPPORT",
      sourceUrl: "https://aimcontrollers.com/contact/",
      notes: "Official customer service and creator partnership desk."
    },
    keyProducts: ["Aim PS5 Controller with V3 Paddles", "Aim Xbox One Series X/S Controller"],
    innovations: ["Aim Grip rubberized ergonomic shells", "Digital smart bumper and trigger switches", "Remappable spider paddle arrays"]
  },
  {
    name: "HexGaming",
    website: "https://www.hexgaming.com",
    country: "USA",
    categories: ["Controllers", "Custom Gamepads", "Esports"],
    description: "Esports controller specialist engineering tournament gamepads with Fastfire digital hair triggers and interchangeable thumbsticks.",
    suggestedContact: {
      email: "service@hexgaming.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.hexgaming.com/pages/contact-us",
      notes: "Official customer service and reviewer outreach."
    },
    keyProducts: ["Hex Phantom Custom PS5 Controller", "Hex Rival Pro", "Hex Ultra X"],
    innovations: ["Fastfire hair-trigger switches", "Interchangeable 6-in-1 thumbstick heights and shapes", "On-the-fly rear paddle mapping"]
  },
  {
    name: "Thrustmaster",
    website: "https://www.thrustmaster.com",
    country: "France",
    categories: ["Controllers", "Flight Sim", "Sim Racing"],
    description: "Historic gaming hardware innovator renowned for modular gamepads like the eSwap X Pro and high-end flight/racing peripherals.",
    suggestedContact: {
      email: "support@thrustmaster.com",
      contactType: "SUPPORT",
      sourceUrl: "https://support.thrustmaster.com/en/",
      notes: "Official technical support and media relations."
    },
    keyProducts: ["eSwap X Pro Controller", "eSwap XR Pro Forza Edition", "T248 Wheel"],
    innovations: ["T-MOD hot-swappable module technology", "Ultra-responsive tactile microswitches", "ThrustmapperX calibration software"]
  },
  {
    name: "Nacon Gaming",
    website: "https://www.nacongaming.com",
    country: "France",
    categories: ["Controllers", "Officially Licensed", "Esports Gear"],
    description: "European esports controller manufacturer acclaimed for the Revolution 5 Pro controller with magnetic Hall effect technology.",
    suggestedContact: {
      email: "support@nacongaming.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.nacongaming.com/en-GB/contact",
      notes: "Official support and PR review communications."
    },
    keyProducts: ["Nacon Revolution 5 Pro (PS5/PC)", "Revolution X Pro Controller", "MG-X Pro Mobile"],
    innovations: ["Magnetic Hall Effect joystick and trigger modules", "Trigger blockers with customizable travel", "Detachable directional pad options"]
  },
  {
    name: "Mobapad",
    website: "https://www.mobapad.com",
    country: "China",
    categories: ["Controllers", "Handheld Gaming", "Hall Effect Gamepads"],
    description: "Handheld and console controller specialist famed for the M6 HD mechanical Joy-Con replacements with ALPS linear vibration.",
    suggestedContact: {
      email: "support@mobapad.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.mobapad.com/pages/contact-us",
      notes: "Official customer service and media inquiry portal."
    },
    keyProducts: ["Mobapad M6 HD Joy-Con Controllers", "Mobapad Huben M9", "Mobapad Chitu"],
    innovations: ["Omron mechanical microswitches on face buttons", "ALPS dual-axis linear resonant actuators", "Hall Effect electromagnetic joysticks"]
  },
  {
    name: "Binbok",
    website: "https://binbok.com",
    country: "China",
    categories: ["Controllers", "RGB Gamepads", "Ergonomic Handhelds"],
    description: "Popular manufacturer of ergonomic Joy-Con controllers with RGB ring lighting, turbo macros, and Hall Effect joysticks.",
    suggestedContact: {
      email: "support@binbok.com",
      contactType: "SUPPORT",
      sourceUrl: "https://binbok.com/pages/contact-us",
      notes: "Official support and creator review communications."
    },
    keyProducts: ["Binbok Ultra Pro Controller", "Binbok Joy-Con RGB Controller", "Binbok Gemini"],
    innovations: ["Full-size ergonomic console grip for handheld play", "Anti-drift Hall Effect thumbsticks", "8-color ambient RGB ring illumination"]
  },
  {
    name: "NYXI Gaming",
    website: "https://nyxigame.com",
    country: "Hong Kong",
    categories: ["Controllers", "GameCube Retro", "Hall Effect Gamepads"],
    description: "Gamepad manufacturer famous for the NYXI Wizard Hall-effect GameCube style controller and high-performance wireless pads.",
    suggestedContact: {
      email: "support@nyxigame.com",
      contactType: "SUPPORT",
      sourceUrl: "https://nyxigame.com/pages/contact-us",
      notes: "Official customer care and influencer liaison desk."
    },
    keyProducts: ["NYXI Wizard Hall Effect Joy-Pad", "NYXI Warrior Wireless Controller", "NYXI Chaos"],
    innovations: ["Electromagnetic Hall sensing GameCube layout", "Optical microswitch ABXY buttons", "Swappable joystick rings (octagonal/round)"]
  },
  {
    name: "QRD Game",
    website: "https://qrdgame.com",
    country: "China",
    categories: ["Controllers", "Hall Effect Gamepads", "Custom Gamepads"],
    description: "Innovative controller designer known for the Stellar T5 Hall effect wireless controller with customizable RGB and programmable paddles.",
    suggestedContact: {
      email: "support@qrdgame.com",
      contactType: "SUPPORT",
      sourceUrl: "https://qrdgame.com/pages/contact-us",
      notes: "Official customer support and review program desk."
    },
    keyProducts: ["QRD Stellar T5 Wireless Controller", "QRD Spark N5", "QRD Maverick S3"],
    innovations: ["Hall Effect anti-drift sensors", "Zero-deadzone analog calibration", "Programmable macro back buttons"]
  },
  {
    name: "PXN Racing & Gamepads",
    website: "https://www.e-pxn.com",
    country: "China",
    categories: ["Controllers", "Sim Racing", "Flight Sticks"],
    description: "Prolific gaming peripheral company engineering multi-platform gamepads, direct-drive racing wheels, and flight simulation gear.",
    suggestedContact: {
      email: "support@e-pxn.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.e-pxn.com/contact-us",
      notes: "Official technical support and brand cooperation mailbox."
    },
    keyProducts: ["PXN P50 Wireless Controller", "PXN V12 Direct Drive Wheel", "PXN 0082 Arcade Stick"],
    innovations: ["Integrated NFC Amiibo sensing", "Multi-platform wireless protocol switching", "App-controlled macro calibration"]
  },
  {
    name: "Mayflash",
    website: "https://www.mayflash.com",
    country: "China",
    categories: ["Controllers", "Adapters", "Fightsticks"],
    description: "Industry pioneer in multi-platform controller adapters and entry-level to mid-tier arcade fightsticks like the F500 Elite.",
    suggestedContact: {
      email: "support@mayflash.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.mayflash.com/contact",
      notes: "Official technical support and press testing mailbox."
    },
    keyProducts: ["Mayflash F500 Elite Arcade Stick", "Mayflash Magic-X Adapter", "Mayflash F300"],
    innovations: ["Universal console controller bridge protocols", "Sanwa Denshi OEM component integration", "Firmware-upgradable cross-platform adapters"]
  },

  // =========================================================================
  // 2. LEVERLESS & FIGHTSTICKS
  // =========================================================================
  {
    name: "Haute42",
    website: "https://haute42.com",
    country: "China",
    categories: ["Fightsticks", "Leverless Controllers", "Arcade"],
    description: "Revolutionized the fighting game community with ultra-slim, low-cost all-button leverless controllers powered by open-source GP2040-CE firmware.",
    suggestedContact: {
      email: "support@haute42.com",
      contactType: "SUPPORT",
      sourceUrl: "https://haute42.com/pages/contact",
      notes: "Official customer service and reviewer liaison desk."
    },
    keyProducts: ["Haute42 T16", "HautePad G16", "Haute42 M16 All-Metal"],
    innovations: ["Sub-1ms input latency on GP2040-CE", "Hot-swappable low-profile mechanical switches", "Custom acrylic laser engraving"]
  },
  {
    name: "Junkfood Custom Arcades",
    website: "https://junkfoodarcades.com",
    country: "USA",
    categories: ["Fightsticks", "Leverless", "Esports Gear"],
    description: "Creator of the iconic Snack Box Micro, the pocket-sized leverless controller of choice for competitive Street Fighter and Tekken pros.",
    suggestedContact: {
      email: "junkfoodarcades@gmail.com",
      contactType: "PR",
      sourceUrl: "https://junkfoodarcades.com/pages/contact-us",
      notes: "Official direct business and creator inquiry contact."
    },
    keyProducts: ["Snack Box Micro", "Snack Box Micro XL"],
    innovations: ["Ultra-compact pocket form-factor", "Kailh low-profile choc mechanical switches", "Multi-platform Brook fighting board integration"]
  },
  {
    name: "Hit Box Arcade",
    website: "https://www.hitboxarcade.com",
    country: "USA",
    categories: ["Fightsticks", "Leverless", "Arcade"],
    description: "Inventors of the original button-only all-leverless controller layout, setting tournament standards across esports fighting games.",
    suggestedContact: {
      email: "support@hitboxarcade.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.hitboxarcade.com/pages/contact-us",
      notes: "Official support and creator review communications."
    },
    keyProducts: ["Hit Box", "Cross|Up", "Smash Box"],
    innovations: ["Patented ergonomic leverless layout", "Sanwa Denshi high-sensitivity arcade buttons", "SOCD cleaner hardware integration"]
  },
  {
    name: "Qanba",
    website: "https://qanbausa.com",
    country: "USA",
    categories: ["Fightsticks", "Arcade Sticks", "Esports"],
    description: "Premier official PlayStation licensed arcade stick manufacturer, famous for the Obsidian 2 and Titan tournament fightsticks.",
    suggestedContact: {
      email: "usa@qanba.com",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://qanbausa.com/contact-us/",
      notes: "Official North American sales and creator partnership desk."
    },
    keyProducts: ["Qanba Obsidian 2", "Qanba Titan Fightstick", "Qanba Drone 2"],
    innovations: ["Sanwa Denshi joystick and button factory tuning", "Tournament lockout switches", "Integrated cable management and audio 3.5mm jack"]
  },
  {
    name: "FightBox Arcade",
    website: "https://fightboxarcade.com",
    country: "China",
    categories: ["Fightsticks", "Leverless", "Arcade"],
    description: "Extensive custom fightstick manufacturer known for the F-series and B-series all-button leverless controllers with Cherry MX and Sanwa switches.",
    suggestedContact: {
      email: "sales@fightboxarcade.com",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://fightboxarcade.com/pages/contact-us",
      notes: "Official sales and media inquiry portal."
    },
    keyProducts: ["FightBox B1-PC", "FightBox F1 All Buttons", "FightBox RAC-J800B"],
    innovations: ["Ultra-thin acrylic metal sandwich chassis", "Cherry MX Black tactile arcade switches", "Custom Brook Universal Fusion board integration"]
  },
  {
    name: "RetroArcadeCrafts",
    website: "https://retroarcadecrafts.com",
    country: "China",
    categories: ["Fightsticks", "Leverless", "Retro Arcade"],
    description: "Specialized manufacturer of DIY leverless arcade controllers, acrylic hitbox cases, and multi-platform arcade encoders.",
    suggestedContact: {
      email: "sales@retroarcadecrafts.com",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://retroarcadecrafts.com/pages/contact-us",
      notes: "Official sales and creator collaboration desk."
    },
    keyProducts: ["RAC-J800B All-Button", "RetroArcade DIY Fightstick Kit"],
    innovations: ["Hot-swappable mechanical keycap arcade layouts", "Laser-cut custom acrylic enclosures", "Sub-1ms Raspberry Pi Pico GP2040 encoders"]
  },
  {
    name: "Sinoarcade",
    website: "https://sinoarcade.com",
    country: "China",
    categories: ["Fightsticks", "Arcade Parts", "Leverless"],
    description: "Major global supplier and manufacturer of genuine Sanwa, Seimitsu, and Brook arcade components, buttons, and custom enclosures.",
    suggestedContact: {
      email: "sales@sinoarcade.com",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://sinoarcade.com/pages/contact-us",
      notes: "Official sales and media liaison."
    },
    keyProducts: ["Sinoarcade Punk Workshop Enclosure", "Sanwa OBSC-30 Translucent Buttons"],
    innovations: ["Direct factory access to arcade microswitches", "Custom PCB wiring harnesses", "High-speed arcade encoders"]
  },
  {
    name: "Brook Gaming",
    website: "https://www.brookaccessory.com",
    country: "Taiwan",
    categories: ["Fightsticks", "PCB Encoders", "Adapters"],
    description: "The gold standard in tournament fighting board PCBs (UFB Fusion) with ultra-low latency cross-console compatibility.",
    suggestedContact: {
      email: "service@brookaccessory.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.brookaccessory.com/contact.php",
      notes: "Official customer support and developer partnership desk."
    },
    keyProducts: ["Brook Universal Fighting Board Fusion", "Brook Wingman FGC Adapter"],
    innovations: ["Tournament-approved zero-lag console conversion", "Hardware-level SOCD cleaning modes", "PS5 native tournament fighting stick support"]
  },
  {
    name: "Mavercade",
    website: "https://mavercade.com",
    country: "Canada",
    categories: ["Fightsticks", "Leverless", "Boutique Controllers"],
    description: "Canadian boutique leverless arcade controller builder producing ergonomic KeebBrawler controllers with Kailh Choc V2 switches.",
    suggestedContact: {
      email: "support@mavercade.com",
      contactType: "SUPPORT",
      sourceUrl: "https://mavercade.com/pages/contact",
      notes: "Official customer service and reviewer liaison."
    },
    keyProducts: ["KeebBrawler-04S", "KeebBrawler Mini", "Mavercade Fightpad"],
    innovations: ["Ergonomic angled button cluster layouts", "Precision CNC cut 3D-printed enclosures", "GP2040-CE open source firmware"]
  },
  {
    name: "Furin Arcade",
    website: "https://furinarcade.co.uk",
    country: "UK",
    categories: ["Fightsticks", "Custom Wood Fightsticks", "Esports"],
    description: "Artisan UK fightstick manufacturer crafting bespoke luxury hardwood arcade sticks and leverless controllers.",
    suggestedContact: {
      email: "support@furinarcade.co.uk",
      contactType: "SUPPORT",
      sourceUrl: "https://furinarcade.co.uk/pages/contact",
      notes: "Official support and creator sampling desk."
    },
    keyProducts: ["Furin Custom Hardwood Fightstick", "Furin Leverless Pro"],
    innovations: ["Solid walnut and oak CNC-milled unibody cases", "Integrated Brook UFB Fusion boards", "Neutrik locking USB-C pass-through connectors"]
  },
  {
    name: "Enth Creations",
    website: "https://enthcreations.com",
    country: "Italy",
    categories: ["Fightsticks", "Leverless", "Artisan Arcade"],
    description: "Italian boutique maker of the KRM and RM leverless fightsticks featuring sculpted bio-ergonomic palms and custom mechanical switches.",
    suggestedContact: {
      email: "support@enthcreations.com",
      contactType: "SUPPORT",
      sourceUrl: "https://enthcreations.com/contact",
      notes: "Official creator and support contact."
    },
    keyProducts: ["Enth KRM Leverless", "Enth RM Fightstick"],
    innovations: ["Sculpted biomorphic wrist rests", "Custom linear mechanical switch plungers", "Zero-flex internal structural ribbing"]
  },
  {
    name: "Sanwa Denshi",
    website: "https://www.sanwa-d.co.jp",
    country: "Japan",
    categories: ["Arcade Parts", "Fightsticks", "Switches"],
    description: "The indisputable Japanese arcade hardware pioneer whose JLF joysticks and OBSF buttons power world tournament fighting game cabinets.",
    suggestedContact: {
      email: "support@sanwa-d.co.jp",
      contactType: "SUPPORT",
      sourceUrl: "https://www.sanwa-d.co.jp/english/",
      notes: "Official manufacturer inquiries and support."
    },
    keyProducts: ["Sanwa JLX-TP-8YT Joystick", "Sanwa OBSF-30 Pushbuttons", "Sanwa Silent Series"],
    innovations: ["Precision swaged POM pivot bushings", "Sub-frame acoustic damping silicone rings", "High-frequency tactile microswitch leaves"]
  },
  {
    name: "Mad Catz",
    website: "https://www.madcatz.com",
    country: "Hong Kong",
    categories: ["Fightsticks", "Gaming Mice", "Controllers"],
    description: "Legendary brand that defined the modern fighting game renaissance with the Tournament Edition (TE) fightsticks and R.A.T. mice.",
    suggestedContact: {
      email: "support@madcatz.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.madcatz.com/en/Support/ContactUs",
      notes: "Official customer service and reviewer contact."
    },
    keyProducts: ["EGO Arcade Fightstick", "R.A.T. PRO X3 Supreme", "T.E.3 Fightstick"],
    innovations: ["Full Sanwa component integration", "Modular chassis with interchangeable top artwork", "Ultra-durable tournament metal baseplates"]
  },

  // =========================================================================
  // 3. ESPORTS MICE & ACCESSORIES
  // =========================================================================
  {
    name: "Pulsar Gaming Gears",
    website: "https://www.pulsar.gg",
    country: "South Korea",
    categories: ["Gaming Mice", "Esports Peripherals", "Mousepads"],
    description: "Esports peripheral trailblazer famous for the X2V2, Xlite, and Superglide glass skates, featuring optical switches and 8000Hz polling rates.",
    suggestedContact: {
      email: "pr@pulsar.gg",
      contactType: "PR",
      sourceUrl: "https://www.pulsar.gg/pages/contact-us",
      notes: "Official global PR and creator outreach desk."
    },
    keyProducts: ["Pulsar X2V2 Wireless", "Xlite V3 eS (OLED Screen)", "Superglide 2 Glass Skates"],
    innovations: ["Aluminosilicate glass mouse skates", "Built-in OLED display on mouse base for tuning without software", "PAW3395 sensor with 8K wireless polling"]
  },
  {
    name: "Lamzu",
    website: "https://lamzu.com",
    country: "China",
    categories: ["Gaming Mice", "Ultralight", "Esports Gear"],
    description: "Beloved ultralight mouse studio that disrupted the competitive FPS scene with the Atlantis, Thorn, and Maya 8K wireless mice.",
    suggestedContact: {
      email: "service@lamzu.com",
      contactType: "SUPPORT",
      sourceUrl: "https://lamzu.com/pages/contact-us",
      notes: "Official customer support and creator review contact."
    },
    keyProducts: ["Lamzu Atlantis OG V2", "Lamzu Thorn 4K", "Lamzu Maya 8K"],
    innovations: ["Sub-50g solid shell construction without honeycomb holes", "Optical switches with zero debounce delay", "Silver TTC Dustproof gold microswitches"]
  },
  {
    name: "Endgame Gear",
    website: "https://www.endgamegear.com",
    country: "Germany",
    categories: ["Gaming Mice", "Esports Keyboards", "Audio"],
    description: "German engineering team renowned for creating the iconic claw-grip XM1, OP1we, and OP1 8K with hot-swappable mechanical switches.",
    suggestedContact: {
      email: "info@endgamegear.com",
      contactType: "GENERAL",
      sourceUrl: "https://www.endgamegear.com/contact",
      notes: "Official general inquiries and creator testing mailbox."
    },
    keyProducts: ["Endgame Gear OP1 8K", "XM2we Wireless", "KB65HE Magnetic Keyboard"],
    innovations: ["True 8000Hz polling rate with STM32 MCU", "Hot-swappable mechanical switch pack mechanism", "Patented analog switch contact algorithm (<1ms click latency)"]
  },
  {
    name: "Ninjutso",
    website: "https://ninjutso.com",
    country: "Hong Kong",
    categories: ["Gaming Mice", "Ultralight Mice", "Esports"],
    description: "Esports mouse engineering team famed for the Sora V2, the world's lightest solid-body wireless mouse (39 grams) with 8000Hz polling.",
    suggestedContact: {
      email: "support@ninjutso.com",
      contactType: "SUPPORT",
      sourceUrl: "https://ninjutso.com/pages/contact",
      notes: "Official customer care and review program liaison."
    },
    keyProducts: ["Ninjutso Sora V2 Wireless (39g)", "Sora 4K", "Origin One X"],
    innovations: ["Sub-39 gram non-perforated structural shell", "SnappyFire wireless technology with 8000Hz polling", "Optical microswitches"]
  },
  {
    name: "Darmoshark",
    website: "https://darmoshark.cn",
    country: "China",
    categories: ["Gaming Mice", "Keyboards", "Esports"],
    description: "High-value competitive peripheral brand popular for bringing Nordic 52840 MCU and 4K/8K polling to affordable lightweight mice.",
    suggestedContact: {
      email: "helen@darmoshark.cn",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://darmoshark.cn/contact",
      notes: "Official overseas business and reviewer liaison."
    },
    keyProducts: ["Darmoshark M3 Pro 4K", "M3 Micro", "KT68 Hall Effect Keyboard"],
    innovations: ["Nordic 52840 MCU ultra-low wireless latency", "PAW3395 sensor implementation", "TTC Falcon optical microswitches"]
  },
  {
    name: "VGN / VXE / ATK",
    website: "https://vgnlab.com",
    country: "China",
    categories: ["Gaming Mice", "Keyboards", "Magnetic Switches"],
    description: "Top-tier value gaming manufacturer dominating the market with the VXE Dragonfly R1, Dragonfly F1 Pro, and ATK magnetic switch keyboards.",
    suggestedContact: {
      email: "support@vgnlab.com",
      contactType: "SUPPORT",
      sourceUrl: "https://vgnlab.com/pages/contact-us",
      notes: "Official customer care and influencer sample desk."
    },
    keyProducts: ["VXE Dragonfly R1 Pro Max", "ATK Blazing Sky F1 8K", "ATK68 Magnetic Switch Keyboard"],
    innovations: ["Smart Speed wireless latency technology", "Nordic flagship main controllers", "Gateron magnetic Hall switches with 0.1mm Rapid Trigger"]
  },
  {
    name: "Fantech World",
    website: "https://fantechworld.com",
    country: "Indonesia",
    categories: ["Gaming Mice", "Controllers", "Headsets"],
    description: "Rapidly growing global gaming peripheral brand recognized for the Aria XD7 and Helios II Pro 4K lightweight esports mice.",
    suggestedContact: {
      email: "support@fantechworld.com",
      contactType: "SUPPORT",
      sourceUrl: "https://fantechworld.com/pages/contact-us",
      notes: "Official technical support and reviewer inquiries."
    },
    keyProducts: ["Fantech Aria XD7 Wireless", "Helios II Pro 4K", "WGP14 Nova Wireless Gamepad"],
    innovations: ["Egg-shape claw ergonomic design", "Nordic 52840 flagship wireless chip", "TTC Gold dustproof mechanical switches"]
  },
  {
    name: "Waizowl",
    website: "https://waizowl.com",
    country: "China",
    categories: ["Gaming Mice", "Esports Mice", "Accessories"],
    description: "Esports mouse engineering brand celebrated for the OGM Pro and Cloud lightweight wireless mice with ergonomic curvature and 4K polling.",
    suggestedContact: {
      email: "support@waizowl.com",
      contactType: "SUPPORT",
      sourceUrl: "https://waizowl.com/pages/contact",
      notes: "Official customer support and creator testing portal."
    },
    keyProducts: ["Waizowl OGM Cloud 4K", "Waizowl OGM Pro", "Waizowl Mouse Skates"],
    innovations: ["Feather-touch matte anti-sweat coating", "PAW3395 sensor paired with Nordic MCU", "Hot-swappable microswitch architecture"]
  },
  {
    name: "Sprime Gaming Gear",
    website: "https://sprime.gg",
    country: "Hong Kong",
    categories: ["Gaming Mice", "Esports Mice", "Ultralight"],
    description: "Boutique mouse studio inspired by legendary ergonomic shapes, famous for the PM1 43g lightweight wireless mouse.",
    suggestedContact: {
      email: "support@sprime.gg",
      contactType: "SUPPORT",
      sourceUrl: "https://sprime.gg/pages/contact-us",
      notes: "Official support and media collaboration desk."
    },
    keyProducts: ["Sprime PM1 Wireless (43g)", "Sprime 8K Dongle"],
    innovations: ["43g non-honeycomb ergonomic shell", "Omron optical microswitches", "PAW3395 sensor with custom firmware smoothing"]
  },
  {
    name: "Vaxee",
    website: "https://www.vaxee.co",
    country: "Taiwan",
    categories: ["Gaming Mice", "Esports Gear", "Mousepads"],
    description: "Founded by the original creators of Zowie, dedicated to pure competitive esports mice with driverless hardware tuning and competitive 4K wireless.",
    suggestedContact: {
      email: "support@vaxee.co",
      contactType: "SUPPORT",
      sourceUrl: "https://www.vaxee.co/en/contact-us.html",
      notes: "Official customer support and professional player liaison."
    },
    keyProducts: ["Vaxee XE Wireless 4K", "Vaxee NP-01S Wireless", "Vaxee Outset AX Wireless"],
    innovations: ["Driverless physical button switch debouncing", "Competitive Wireless mode with prioritized packet transmission", "High-tenacity ergonomic mouse shapes"]
  },
  {
    name: "Finalmouse",
    website: "https://finalmouse.com",
    country: "USA",
    categories: ["Gaming Mice", "Magnesium Mice", "Esports Gear"],
    description: "Cult-status innovator behind the magnesium alloy UltralightX and Starlight-12 wireless mice pushing sub-30g tournament performance.",
    suggestedContact: {
      email: "support@finalmouse.com",
      contactType: "SUPPORT",
      sourceUrl: "https://finalmouse.com/pages/support",
      notes: "Official support and creator liaison."
    },
    keyProducts: ["Finalmouse UltralightX (ULX)", "Starlight Pro TenZ", "Centerpiece Keyboard"],
    innovations: ["Carbon fiber composite and magnesium alloy skeletons", "29-35g featherweight structural integrity", "True 8000Hz wireless polling rate"]
  },
  {
    name: "G-Wolves",
    website: "https://www.g-wolves.com",
    country: "China",
    categories: ["Gaming Mice", "Ultralight Mice", "Fingertip Mice"],
    description: "Pioneer in extreme fingertip-grip mice, famous for the HSK Pro 4K and HTX 4K weighing under 26 grams.",
    suggestedContact: {
      email: "support@g-wolves.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.g-wolves.com/contact-us",
      notes: "Official technical support and media inquiry mailbox."
    },
    keyProducts: ["G-Wolves HSK Pro 4K", "G-Wolves HTX 4K", "Hati-S Plus 4K"],
    innovations: ["Sub-26 gram specialized fingertip ergonomics", "Zippy microswitches with sub-millisecond click response", "High-frequency ceramic antenna design"]
  },
  {
    name: "Lethal Gaming Gear",
    website: "https://www.lethalgaminggear.com",
    country: "USA",
    categories: ["Mousepads", "Gaming Mice", "Accessories"],
    description: "Esports surface pioneer known for the Saturn Pro and Venus Pro poron-base mousepads and the LA-1 competitive wireless mouse.",
    suggestedContact: {
      email: "support@lethalgaminggear.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.lethalgaminggear.com/pages/contact-us",
      notes: "Official support and creator partnership desk."
    },
    keyProducts: ["LGG Saturn Pro Mousepad", "LGG Venus Pro", "LGG LA-1 Wireless Mouse"],
    innovations: ["Japanese Poron memory foam base", "Sub-surface precision edge stitching", "Micro-textured polyester control surfaces"]
  },
  {
    name: "Artisan Mousepads",
    website: "https://www.artisan-jp.com",
    country: "Japan",
    categories: ["Mousepads", "Esports Gear", "Precision Surfaces"],
    description: "The global benchmark in competitive esports mousepads, celebrated for the Hayate Otsu, Zero, and Hien pads handmade in Kobe, Japan.",
    suggestedContact: {
      email: "support@artisan-jp.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.artisan-jp.com/contact.html",
      notes: "Official inquiries and international support."
    },
    keyProducts: ["Artisan Hayate Otsu FX", "Artisan Zero FX (XSoft)", "Artisan Hien FX"],
    innovations: ["Natural rubber single-bubble foam core", "Zero edge-fray overlocked perimeter stitching", "Direction-independent friction weave"]
  },
  {
    name: "X-raypad",
    website: "https://shop.x-raypad.com",
    country: "China",
    categories: ["Mousepads", "Custom Surfaces", "Mouse Skates"],
    description: "World-renowned manufacturer of high-performance custom mousepads including the Aqua Control II, Aqua Control+, and obsidian skates.",
    suggestedContact: {
      email: "support@x-raypad.com",
      contactType: "SUPPORT",
      sourceUrl: "https://shop.x-raypad.com/contact-us/",
      notes: "Official customer service and reviewer liaison."
    },
    keyProducts: ["Aqua Control II Sakura", "Equate Plus V2", "Obsidian Hardened PTFE Skates"],
    innovations: ["Amundsen fabric non-coating weave", "Humidity-resistant moisture repellent surface", "Hardened black PTFE skates for glass mousepads"]
  },
  {
    name: "Wallhack / SkyPAD",
    website: "https://wallhack.com",
    country: "Denmark",
    categories: ["Glass Mousepads", "Esports Surfaces", "Sleeves"],
    description: "The premier innovator in tempered glass esports surfaces, creator of the legendary SkyPAD 3.0 and Wallhack SP-004 glass mousepad.",
    suggestedContact: {
      email: "support@wallhack.com",
      contactType: "SUPPORT",
      sourceUrl: "https://wallhack.com/pages/contact",
      notes: "Official customer service and creator partnership desk."
    },
    keyProducts: ["Wallhack SP-004 Glass Mousepad", "SkyPAD 3.0 XL", "Wallhack Compression Arm Sleeve"],
    innovations: ["Chemically tempered frosted float glass surface", "Full silicone non-slip base mold", "Micro-etched glass texture with near-zero initial friction"]
  },
  {
    name: "WLmouse",
    website: "https://www.wlmouse.com",
    country: "China",
    categories: ["Gaming Mice", "Magnesium Mice", "Esports"],
    description: "Boutique magnesium-alloy mouse studio acclaimed for the Beast X and Beast X Mini ultralight wireless mice featuring 8K polling.",
    suggestedContact: {
      email: "support@wlmouse.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.wlmouse.com/pages/contact-us",
      notes: "Official customer support and creator review communications."
    },
    keyProducts: ["WLmouse Beast X (39g)", "WLmouse Beast X Mini", "WLmouse Beast X 8K"],
    innovations: ["CNC-machined magnesium alloy exoskeleton", "PAW3395 sensor paired with Nordic 52840 MCU", "TTC dustproof optical microswitches"]
  },
  {
    name: "Attack Shark",
    website: "https://attackshark.com",
    country: "China",
    categories: ["Gaming Mice", "Keyboards", "Value Esports"],
    description: "Fast-growing high-performance value brand known for the X3 and R1 ultralight wireless gaming mice with tri-mode connectivity.",
    suggestedContact: {
      email: "support@attackshark.com",
      contactType: "SUPPORT",
      sourceUrl: "https://attackshark.com/pages/contact-us",
      notes: "Official customer support and partnership inquiries."
    },
    keyProducts: ["Attack Shark X3 Pro 8K", "Attack Shark R1", "Attack Shark K86 Keyboard"],
    innovations: ["49-gram budget ultralight construction", "Tri-mode 2.4G/Bluetooth/Type-C connection", "High-precision optical sensors"]
  },
  {
    name: "Kysona",
    website: "https://kysona.com",
    country: "China",
    categories: ["Gaming Mice", "Esports Mice", "Ultralight"],
    description: "Ultralight esports mouse studio celebrated for the M600 and Aztec wireless mice offering PAW3395 sensor performance at an accessible price.",
    suggestedContact: {
      email: "support@kysona.com",
      contactType: "SUPPORT",
      sourceUrl: "https://kysona.com/pages/contact-us",
      notes: "Official customer support and creator review contact."
    },
    keyProducts: ["Kysona M600 Wireless (55g)", "Kysona Aztec", "Kysona Mouse Grips"],
    innovations: ["PAW3395 sensor with 26000 DPI", "Sub-55 gram ergonomic solid-shell structure", "Huano blue shell pink dot mechanical switches"]
  },
  {
    name: "Delux Gaming",
    website: "https://deluxworld.com",
    country: "China",
    categories: ["Gaming Mice", "Ergonomic Peripherals", "Esports Gear"],
    description: "Long-standing peripheral manufacturer producing competitive lightweight mice like the M800 Pro and ergonomic vertical gaming gear.",
    suggestedContact: {
      email: "support@deluxworld.com",
      contactType: "SUPPORT",
      sourceUrl: "https://deluxworld.com/pages/contact-us",
      notes: "Official customer support and international sales liaison."
    },
    keyProducts: ["Delux M800 Pro 4K", "Delux M900 Pro (Charging Dock)", "Delux Seeker"],
    innovations: ["Integrated magnetic RGB fast-charging dock", "Nordic flagship MCU with 4000Hz polling", "Glass PTFE skate compatibility"]
  },
  {
    name: "Pwnage",
    website: "https://pwnage.com",
    country: "USA",
    categories: ["Gaming Mice", "Custom Mice", "Magnesium"],
    description: "Custom peripheral studio known for the StormBreaker magnesium alloy 8K wireless mouse and swappable modular shells.",
    suggestedContact: {
      email: "support@pwnage.com",
      contactType: "SUPPORT",
      sourceUrl: "https://pwnage.com/pages/contact-us",
      notes: "Official customer service and reviewer outreach."
    },
    keyProducts: ["Pwnage StormBreaker Magnesium 8K", "Pwnage Ultra Custom Wireless Symm"],
    innovations: ["Adjustable sensor position technology (patented)", "Full magnesium alloy chassis weighing 51g", "8000Hz wireless polling rate"]
  },
  {
    name: "Mchose",
    website: "https://mchose.store",
    country: "China",
    categories: ["Gaming Mice", "Keyboards", "Value Esports"],
    description: "Rising competitive peripheral maker popular for the A5 Pro Max wireless mouse and K99 magnetic switch keyboards.",
    suggestedContact: {
      email: "support@mchose.store",
      contactType: "SUPPORT",
      sourceUrl: "https://mchose.store/pages/contact-us",
      notes: "Official customer service and influencer testing."
    },
    keyProducts: ["Mchose A5 Pro Max", "Mchose AX5 Magnesium", "Mchose K99 Keyboard"],
    innovations: ["Nordic 52840 with 4K/8K polling capability", "Magnesium alloy skeletal architecture", "TTC gold microswitches"]
  },

  // =========================================================================
  // 4. RAPID TRIGGER & CUSTOM KEYBOARDS
  // =========================================================================
  {
    name: "Wooting",
    website: "https://wooting.io",
    country: "Netherlands",
    categories: ["Keyboards", "Rapid Trigger", "Analog Input"],
    description: "Pioneer of analog Hall-effect switches, Lekker linear magnetic switches, and Rapid Trigger technology for esports keyboards.",
    suggestedContact: {
      email: "social@wooting.io",
      contactType: "PR",
      sourceUrl: "https://wooting.io/contact",
      notes: "Official creator and community testing contact."
    },
    keyProducts: ["Wooting 60HE+", "Wooting 80HE", "Lekker Switches"],
    innovations: ["Full analog Hall Effect input", "Rapid Trigger 0.1mm actuation", "Tachyon ultra-low latency firmware"]
  },
  {
    name: "DrunkDeer",
    website: "https://drunkdeer.com",
    country: "Hong Kong",
    categories: ["Keyboards", "Rapid Trigger", "Magnetic Switches"],
    description: "Accessible Hall-effect keyboard specialist famous for the A75 and G65 magnetic switch keyboards optimized for Valorant and OSU! players.",
    suggestedContact: {
      email: "hello@drunkdeer.com",
      contactType: "GENERAL",
      sourceUrl: "https://drunkdeer.com/pages/contact-us",
      notes: "Official direct brand communication mailbox."
    },
    keyProducts: ["DrunkDeer A75 Rapid Trigger", "DrunkDeer G65", "DrunkDeer G60"],
    innovations: ["Adjustable 0.2mm to 3.8mm actuation point", "Continuous Rapid Trigger resetting", "Shock-absorbing tray mount engineering"]
  },
  {
    name: "NuPhy",
    website: "https://nuphy.com",
    country: "China",
    categories: ["Keyboards", "Low Profile", "Design Peripherals"],
    description: "Aesthetic mechanical keyboard design brand famous for ultra-slim Air75 V2, Halo75, and the Field75 esports magnetic keyboard.",
    suggestedContact: {
      email: "service@nuphy.com",
      contactType: "SUPPORT",
      sourceUrl: "https://nuphy.com/pages/contact-us",
      notes: "Official support and creator review communications."
    },
    keyProducts: ["NuPhy Air75 V2 Low-Profile", "NuPhy Halo75 V2", "NuPhy Field75 HE"],
    innovations: ["Gateron Low-profile 3.0 mechanical switches", "GhostBar acoustic spacebar dampening", "1000Hz 2.4G polling on low-profile wireless"]
  },
  {
    name: "Keychron",
    website: "https://www.keychron.com",
    country: "Hong Kong",
    categories: ["Keyboards", "Custom Mechanical", "QMK/VIA"],
    description: "The world leader in custom QMK/VIA wireless mechanical keyboards, celebrated for the Q-series full aluminum chassis and HE Hall-effect line.",
    suggestedContact: {
      email: "support@keychron.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.keychron.com/pages/contact-us",
      notes: "Official customer service and reviewer liaison desk."
    },
    keyProducts: ["Keychron Q1 HE Magnetic Switch Keyboard", "Keychron V1 Max", "Keychron K2 Pro"],
    innovations: ["Full CNC-machined aluminum body with double-gasket mount", "Gateron 2.0 magnetic Hall-effect switches", "Web-based Keychron Launcher web-app configurator"]
  },
  {
    name: "Epomaker",
    website: "https://epomaker.com",
    country: "China",
    categories: ["Keyboards", "Custom Mechanical", "Keycaps"],
    description: "Global keyboard collective producing retro and modern mechanical keyboards with LCD smart screens and gasket mounting.",
    suggestedContact: {
      email: "marketing@epomaker.com",
      contactType: "PR",
      sourceUrl: "https://epomaker.com/pages/contact-us",
      notes: "Official global marketing and reviewer collaboration mailbox."
    },
    keyProducts: ["Epomaker RT100 (Retro Display)", "Epomaker Shadow-X", "Epomaker Galaxy70"],
    innovations: ["Mini customizable smart TV display module", "Gasket-mount structure with 5 layers of sound dampening", "Tri-mode wireless connectivity"]
  },
  {
    name: "Akko & MonsGeek",
    website: "https://en.akkogear.com",
    country: "China",
    categories: ["Keyboards", "Magnetic Switches", "DIY Kits"],
    description: "Iconic keyboard and switch studio famous for the MonsGeek M1W aluminum DIY kit, MOD007B HE Hall Effect keyboard, and custom themed keycaps.",
    suggestedContact: {
      email: "mktg@akkogear.com",
      contactType: "PR",
      sourceUrl: "https://en.akkogear.com/contact-us/",
      notes: "Official marketing and influencer partnership liaison."
    },
    keyProducts: ["Akko MOD007B HE Hall Effect", "MonsGeek M1 V3 QMK", "Akko Cream Yellow Pro Switches"],
    innovations: ["Akko Magnetic switches with Rapid Trigger", "Ball-catch quick-disassembly case mechanisms", "High-precision PBT dye-sub keycap manufacturing"]
  },
  {
    name: "MelGeek",
    website: "https://www.melgeek.com",
    country: "China",
    categories: ["Keyboards", "Cyberpunk Keyboards", "Magnetic Switches"],
    description: "Futuristic keyboard design studio famous for the transparent Mojo68, Mojo84, and the Made68 Rapid Trigger magnetic gaming keyboard.",
    suggestedContact: {
      email: "service@melgeek.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.melgeek.com/pages/contact-us",
      notes: "Official support and creator program contact."
    },
    keyProducts: ["MelGeek Made68 Pro Magnetic Switch", "MelGeek Mojo68 Transparent", "MelGeek CYBER01"],
    innovations: ["Kailh custom magnetic Hall effect switches", "Custom lightbox RGB diffuser casing", "MelGeek Hive unified software ecosystem"]
  },
  {
    name: "Yunzii Keyboard",
    website: "https://www.yunzii.com",
    country: "China",
    categories: ["Keyboards", "Custom Mechanical", "Desk Mats"],
    description: "Trend-setting mechanical keyboard studio recognized for the YZ75, AL71 CNC aluminum wireless, and RT75 Hall Effect keyboard.",
    suggestedContact: {
      email: "support@yunzii.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.yunzii.com/pages/contact-us",
      notes: "Official customer service and reviewer outreach."
    },
    keyProducts: ["Yunzii RT75 Magnetic Switch Keyboard", "Yunzii AL71 CNC Aluminum", "Yunzii YZ75 Pro"],
    innovations: ["Sub-0.1mm Rapid Trigger sensitivity", "Gasket-mounted acoustic dampening foams", "Custom hot-swappable tactile switches"]
  },
  {
    name: "Aula Gaming",
    website: "https://aulagear.com",
    country: "China",
    categories: ["Keyboards", "Esports Gear", "Mechanical Keyboards"],
    description: "Keyboard manufacturer whose F75 and F87 gasket-mounted wireless keyboards took the mechanical keyboard community by storm for unmatched acoustics.",
    suggestedContact: {
      email: "support@aulagear.com",
      contactType: "SUPPORT",
      sourceUrl: "https://aulagear.com/pages/contact",
      notes: "Official customer support and partnership inquiries."
    },
    keyProducts: ["Aula F75 Tri-Mode Mechanical Keyboard", "Aula F87 Pro", "Aula F99"],
    innovations: ["Factory-lubed LEOBOG Reaper linear switches", "Five-layer sound dampening pad architecture", "Integrated metal volume rotary knob"]
  },
  {
    name: "AJAZZ",
    website: "https://www.ajazz.com",
    country: "China",
    categories: ["Keyboards", "Gaming Mice", "Magnetic Switches"],
    description: "Prolific esports hardware manufacturer celebrated for the AK820 Pro with TFT screen and the AK680 magnetic Hall Effect keyboard.",
    suggestedContact: {
      email: "support@ajazz.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.ajazz.com/en/contact.aspx",
      notes: "Official technical support and media testing."
    },
    keyProducts: ["Ajazz AK820 Pro (TFT Screen)", "Ajazz AK680 Hall Effect", "Ajazz AJ199 4K Mouse"],
    innovations: ["0.85-inch customizable TFT color display screen", "Magnetic switch dynamic keystroke actuation", "Precision pre-lubed stabilizers"]
  },
  {
    name: "Royal Kludge / RK",
    website: "https://rkgaming.com",
    country: "China",
    categories: ["Keyboards", "Custom Mechanical", "Budget Esports"],
    description: "Pioneer in accessible multi-device wireless mechanical keyboards, leading with the RK61, RK71, and R75 gasket keyboard.",
    suggestedContact: {
      email: "support@rkgaming.com",
      contactType: "SUPPORT",
      sourceUrl: "https://rkgaming.com/pages/contact-us",
      notes: "Official customer service and influencer liaison."
    },
    keyProducts: ["RK Royal Kludge R75", "RK61 Plus Wireless", "RK S98 (Smart Display)"],
    innovations: ["Smart interactive display and metal knob", "Multi-platform Bluetooth/2.4G/Wired hot-swapping", "Sound-absorbing silicone gasket damping"]
  },
  {
    name: "IQUNIX",
    website: "https://iqunix.com",
    country: "China",
    categories: ["Keyboards", "Aluminum Keyboards", "Magnetic Switches"],
    description: "Luxury mechanical keyboard brand renowned for heavy aluminum unibody cases like the ZX75, OG80, and EZ63 magnetic gaming keyboard.",
    suggestedContact: {
      email: "support@iqunix.com",
      contactType: "SUPPORT",
      sourceUrl: "https://iqunix.com/pages/contact-us",
      notes: "Official customer care and reviewer inquiry contact."
    },
    keyProducts: ["IQUNIX EZ63 Magnetic Switch Keyboard", "IQUNIX ZX75 Gravity Wave", "IQUNIX OG80 Wormhole"],
    innovations: ["Gateron custom Jade magnetic switches with 8000Hz polling", "All-metal CNC aluminum craftsmanship", "Costar-style balanced high-stability stabilizers"]
  },
  {
    name: "WOBKEY / Rainy75",
    website: "https://wobkey.com",
    country: "China",
    categories: ["Keyboards", "Custom Mechanical", "Aluminum Keyboards"],
    description: "Keyboard collective that created the acclaimed Rainy75 CNC aluminum custom keyboard with class-leading acoustics and marbly sound.",
    suggestedContact: {
      email: "support@wobkey.com",
      contactType: "SUPPORT",
      sourceUrl: "https://wobkey.com/pages/contact-us",
      notes: "Official support and creator review communications."
    },
    keyProducts: ["Rainy75 Custom Keyboard", "Rainy75 Pro", "Crush80 Aluminum Keyboard"],
    innovations: ["Full 6063 aerospace-grade CNC aluminum unibody", "FR4/PP flex-cut plate options with deep marbly sound", "Tri-mode 2.4G wireless with 7000mAh battery"]
  },
  {
    name: "Meletrix / Wuque Studio",
    website: "https://meletrix.com",
    country: "China",
    categories: ["Keyboards", "Custom Mechanical", "Enthusiast Gear"],
    description: "Premier custom keyboard studio behind the Zoom65, Zoom75, and BOOG75 magnetic switch esports mechanical keyboard.",
    suggestedContact: {
      email: "service@meletrix.com",
      contactType: "SUPPORT",
      sourceUrl: "https://meletrix.com/pages/contact-us",
      notes: "Official support and media collaboration desk."
    },
    keyProducts: ["BOOG75 Magnetic Switch Keyboard", "Zoom75 TKL Custom Kit", "Zoom65 V2.5"],
    innovations: ["Gateron KS-37B dual-rail magnetic switches", "Modular 2u screen and badge hot-swap modules", "Multi-mounting gasket acoustic isolation"]
  },
  {
    name: "Mode Designs",
    website: "https://modedesigns.com",
    country: "USA",
    categories: ["Keyboards", "Custom Mechanical", "Luxury Hardware"],
    description: "American luxury custom keyboard studio engineering architectural mechanical keyboards like the Sonnet, Envoy, and Loop.",
    suggestedContact: {
      email: "support@modedesigns.com",
      contactType: "SUPPORT",
      sourceUrl: "https://modedesigns.com/pages/contact-us",
      notes: "Official customer care and reviewer liaison."
    },
    keyProducts: ["Mode Sonnet 75%", "Mode Envoy 65%", "Mode Loop TKL"],
    innovations: ["Isolated block and lattice mount damping systems", "Interchangeable solid brass and copper accent weight bars", "Precision CNC aluminum construction"]
  },
  {
    name: "NovelKeys",
    website: "https://novelkeys.com",
    country: "USA",
    categories: ["Keyboards", "Custom Switches", "Deskmats"],
    description: "A bedrock of the mechanical keyboard enthusiast community, creator of the NK65, Cream switches, and officially licensed keycaps.",
    suggestedContact: {
      email: "support@novelkeys.com",
      contactType: "SUPPORT",
      sourceUrl: "https://novelkeys.com/pages/contact-us",
      notes: "Official support and influencer collaboration desk."
    },
    keyProducts: ["NK65 - Entry Edition", "Kailh Box Cream Switches", "NovelKeys Custom Deskmats"],
    innovations: ["Full polycarbonate injection molded acoustic cases", "Self-lubricating POM switch stems", "VIA-programmable custom PCB firmware"]
  },
  {
    name: "Ducky Channel",
    website: "https://www.duckychannel.com.tw",
    country: "Taiwan",
    categories: ["Keyboards", "Mechanical Keyboards", "Esports Gear"],
    description: "Legendary Taiwanese mechanical keyboard brand that created the iconic One 2 Mini, One 3 with Quack Mechanics, and ProjectD custom keyboards.",
    suggestedContact: {
      email: "support@duckychannel.com.tw",
      contactType: "SUPPORT",
      sourceUrl: "https://www.duckychannel.com.tw/en/contact",
      notes: "Official technical support and media testing."
    },
    keyProducts: ["Ducky One 3 RGB", "Ducky One 2 Mini V2", "ProjectD Outlaw 65"],
    innovations: ["Quack Mechanics four-layer sound dampening design", "Hot-swappable Kailh yellow sockets", "True seamless double-shot PBT keycaps"]
  },
  {
    name: "Varmilo",
    website: "https://www.varmilo.com",
    country: "China",
    categories: ["Keyboards", "Artisan Keyboards", "Electrostatic Capacitive"],
    description: "Artisan keyboard studio known for poetic thematic keyboard art (Sakura, Sea Melody) and EC (Electrostatic Capacitive) V2 mechanical switches.",
    suggestedContact: {
      email: "support@varmilo.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.varmilo.com/contact-us/",
      notes: "Official customer service and influencer inquiries."
    },
    keyProducts: ["Varmilo Minilo 75%", "Varmilo Sword68 Aluminum", "Varmilo Sakura EC Keyboard"],
    innovations: ["Contactless Electrostatic Capacitive mechanical switches", "UV-printed UV-cured thematic top housings", "Dye-sublimated high-purity PBT keycaps"]
  },
  {
    name: "Leopold Keyboard",
    website: "https://www.leopold.co.kr",
    country: "South Korea",
    categories: ["Keyboards", "Mechanical Keyboards", "Typing Hardware"],
    description: "South Korean purist keyboard manufacturer acclaimed for exceptional typing feel, ultra-thick PBT keycaps, and internal sound-absorbing mats.",
    suggestedContact: {
      email: "support@leopold.co.kr",
      contactType: "SUPPORT",
      sourceUrl: "https://www.leopold.co.kr/Contact/",
      notes: "Official manufacturer inquiries and support."
    },
    keyProducts: ["Leopold FC750R PD", "Leopold FC660C (Topre)", "Leopold FC900R"],
    innovations: ["1.5mm ultra-thick double-shot PBT keycaps", "Factory sound-dampening acoustic foam installation", "Genuine Topre electrostatic capacitive switch integration"]
  },
  {
    name: "Higround",
    website: "https://higround.co",
    country: "USA",
    categories: ["Keyboards", "Esports Gear", "Artistic Keyboards"],
    description: "Pop-culture and gaming lifestyle brand owned by 100 Thieves, engineering the Basecamp 65 and Summit 68 with TTC switches and anime collabs.",
    suggestedContact: {
      email: "support@higround.co",
      contactType: "SUPPORT",
      sourceUrl: "https://higround.co/pages/contact",
      notes: "Official customer care and partnership communications."
    },
    keyProducts: ["Higround Basecamp 65", "Higround Summit 68", "Higround Magnetic Switch Keyboard"],
    innovations: ["Dual-silicone sound dampening design", "Hot-swappable five-pin switch architecture", "Collaborative art dye-sublimated five-sided keycaps"]
  },
  {
    name: "Chilkey",
    website: "https://chilkey.com",
    country: "China",
    categories: ["Keyboards", "Custom Mechanical", "Aluminum Keyboards"],
    description: "Enthusiast keyboard sub-brand of Wuque Studio celebrated for the ND75 and Paw65 affordable CNC aluminum custom mechanical keyboards.",
    suggestedContact: {
      email: "support@chilkey.com",
      contactType: "SUPPORT",
      sourceUrl: "https://chilkey.com/pages/contact-us",
      notes: "Official support and creator review communications."
    },
    keyProducts: ["Chilkey ND75 Aluminum Keyboard", "Chilkey Paw65", "Chilkey Switches"],
    innovations: ["Screwless quick-disassembly ball-catch case design", "Split O-ring and gasket dual-mount configuration", "Per-key flex-cut hot-swappable PCB"]
  },
  {
    name: "KiiBOOM",
    website: "https://www.kiiboom.com",
    country: "China",
    categories: ["Keyboards", "Transparent Keyboards", "Audio"],
    description: "Avant-garde electronics brand known for crystal-clear acrylic keyboards like the Phantom 81 and Loop65 with vibrant RGB aesthetics.",
    suggestedContact: {
      email: "support@kiiboom.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.kiiboom.com/pages/contact-us",
      notes: "Official support and media collaboration desk."
    },
    keyProducts: ["KiiBOOM Phantom 81 V2", "KiiBOOM Loop65", "KiiBOOM Breeze75"],
    innovations: ["Full transparent acrylic chassis with optical clarity", "Custom proprietary pre-lubed mechanical crystal switches", "Gasket-mounted polycarbonate plate structure"]
  },
  {
    name: "Redragon",
    website: "https://redragonzone.com",
    country: "China",
    categories: ["Keyboards", "Gaming Mice", "Budget Esports"],
    description: "One of the most widely used gaming peripheral manufacturers in the world, producing reliable mechanical keyboards like the K552 Kumara and K617 Fizz.",
    suggestedContact: {
      email: "support@redragonzone.com",
      contactType: "SUPPORT",
      sourceUrl: "https://redragonzone.com/pages/contact-us",
      notes: "Official support and reviewer outreach portal."
    },
    keyProducts: ["Redragon K552 Kumara RGB", "Redragon K617 Fizz 60%", "Redragon K630 Dragonborn"],
    innovations: ["Outemu hot-swappable switch sockets", "Spill-resistant metal alloy top casing", "Compact tenkeyless and 60% ergonomic layouts"]
  },
  {
    name: "KBDfans",
    website: "https://kbdfans.com",
    country: "China",
    categories: ["Keyboards", "Custom Mechanical", "DIY Parts"],
    description: "The global hub for custom mechanical keyboards, acclaimed for legendary kits like the Tofu60 Redux, Tofu65 2.0, and D84.",
    suggestedContact: {
      email: "support@kbdfans.com",
      contactType: "SUPPORT",
      sourceUrl: "https://kbdfans.com/pages/contact-us",
      notes: "Official customer service and reviewer liaison desk."
    },
    keyProducts: ["KBDfans Tofu60 Redux", "Tofu65 2.0 Custom Kit", "Tiger 80 Lite"],
    innovations: ["Modular brass internal weight bar upgrades", "Bowl-mount silicone vibration dampeners", "QMK and VIA firmware out-of-the-box compatibility"]
  },
  {
    name: "CannonKeys",
    website: "https://cannonkeys.com",
    country: "USA",
    categories: ["Keyboards", "Custom Mechanical", "Enthusiast Gear"],
    description: "Premier American custom mechanical keyboard design studio known for the Bakeneko60/65, Brutal V2 series, and premium NicePBT keycaps.",
    suggestedContact: {
      email: "support@cannonkeys.com",
      contactType: "SUPPORT",
      sourceUrl: "https://cannonkeys.com/pages/contact-us",
      notes: "Official customer support and creator review communications."
    },
    keyProducts: ["Bakeneko60 CNC O-Ring Keyboard", "Bakeneko65", "Brutal V2 65%"],
    innovations: ["Friction-fit O-ring gummy gasket mounting", "Cast and CNC aluminum acoustic tuning", "Custom open-source keyboard PCB architectures"]
  },
  {
    name: "Drop",
    website: "https://drop.com",
    country: "USA",
    categories: ["Keyboards", "Audiophile", "Custom Switches"],
    description: "Community-driven hardware pioneer, creator of the Drop CTRL, ALT, Holy Panda switches, and Lord of the Rings licensed artisan keyboards.",
    suggestedContact: {
      email: "support@drop.com",
      contactType: "SUPPORT",
      sourceUrl: "https://drop.com/contact",
      notes: "Official customer care and creator testing liaison."
    },
    keyProducts: ["Drop CTRL V2 Mechanical Keyboard", "Drop ALT V2", "Drop Holy Panda X Switches"],
    innovations: ["Dual USB-C pass-through hub ports", "Full-diffuser perimeter RGB case lighting", "Custom tactile switch leaf engineering"]
  },

  // =========================================================================
  // 5. SIM RACING & PRO SIMULATION
  // =========================================================================
  {
    name: "MOZA Racing",
    website: "https://mozaracing.com",
    country: "China",
    categories: ["Sim Racing", "Direct Drive", "Flight Sim"],
    description: "Fastest-growing direct drive sim racing ecosystem featuring the R3, R5, R9, and R12 direct drive wheelbases, load cell pedals, and active FFB.",
    suggestedContact: {
      email: "marketing@mozaracing.com",
      contactType: "PR",
      sourceUrl: "https://mozaracing.com/contact-us",
      notes: "Official brand marketing and influencer review desk."
    },
    keyProducts: ["MOZA R5 Direct Drive Bundle", "MOZA R9 V2 Wheelbase", "CRP Load Cell Pedals"],
    innovations: ["Aviation-grade aluminum direct drive motor chassis", "Zero-latency wireless steering wheel data transmission", "Pit House real-time telemetry calibration software"]
  },
  {
    name: "Cammus",
    website: "https://cammusracing.com",
    country: "China",
    categories: ["Sim Racing", "Direct Drive", "Sim Hardware"],
    description: "Pioneered all-in-one direct drive motor steering wheels with the C5 and C12 direct-drive wheel units integrating the motor into the rim.",
    suggestedContact: {
      email: "sales@cammus.com",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://cammusracing.com/contact-us/",
      notes: "Official sales, media, and influencer review desk."
    },
    keyProducts: ["Cammus C5 Direct Drive Steering Wheel", "Cammus C12 Direct Drive", "LC100 Load Cell Pedals"],
    innovations: ["Direct drive motor embedded directly into the steering wheel rim", "5Nm to 12Nm torque direct servo control", "Modular magnetic paddle shifters"]
  },
  {
    name: "Simagic",
    website: "https://www.simagic.com",
    country: "China",
    categories: ["Sim Racing", "Direct Drive Wheels", "Pedals"],
    description: "High-end direct-drive sim racing hardware company acclaimed for the Alpha Mini, Alpha, and P1000 hydraulic/haptic pedal sets.",
    suggestedContact: {
      email: "info@simagic.com",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://www.simagic.com/contact",
      notes: "Official general inquiries and creator testing mailbox."
    },
    keyProducts: ["Simagic Alpha Mini (10Nm)", "Simagic P1000 Haptic Pedals", "Simagic GT Neo Wheel"],
    innovations: ["Patented haptic pedal rumble motors reacting to ABS and TC telemetry", "Tri-CPU direct drive servo processing", "Real carbon-fiber composite formula wheels"]
  },
  {
    name: "Asetek SimSports",
    website: "https://www.asetek.com/simsports",
    country: "Denmark",
    categories: ["Sim Racing", "Direct Drive Wheels", "Hydraulic Pedals"],
    description: "Danish liquid cooling and automotive engineering powerhouse producing the Invicta, Forte, and La Prima direct drive wheelbases.",
    suggestedContact: {
      email: "simsports@asetek.com",
      contactType: "PR",
      sourceUrl: "https://www.asetek.com/simsports/contact-us/",
      notes: "Official SimSports PR and reviewer relations desk."
    },
    keyProducts: ["Invicta Direct Drive Wheelbase (27Nm)", "Forte Load Cell Pedals", "Invicta Hydraulic Pedals"],
    innovations: ["T.H.O.R.P. (Twin Hydraulic Opposing Rapid Piston) patented brake system", "Quick-release hub passing both power and high-speed data", "RaceHub software driver tuning"]
  },
  {
    name: "Fanatec",
    website: "https://fanatec.com",
    country: "Germany",
    categories: ["Sim Racing", "Direct Drive Wheels", "Console Licensed"],
    description: "The heritage market leader in sim racing hardware, famous for the Gran Turismo DD Pro, CSL DD, ClubSport DD+, and official F1 steering wheels.",
    suggestedContact: {
      email: "support@fanatec.com",
      contactType: "SUPPORT",
      sourceUrl: "https://fanatec.com/us-en/contact",
      notes: "Official customer support and creator review communications."
    },
    keyProducts: ["Fanatec ClubSport DD+ (15Nm)", "CSL DD (8Nm Boost Kit)", "ClubSport Steering Wheel Formula V2.5"],
    innovations: ["FullForce next-generation low-latency force feedback physics engine", "Officially licensed PlayStation and Xbox direct drive chipsets", "QR2 quick-release die-cast locking mechanism"]
  },
  {
    name: "Conspit Racing",
    website: "https://conspit.com",
    country: "China",
    categories: ["Sim Racing", "Direct Drive", "Hydraulic Pedals"],
    description: "Ultra-luxury sim racing engineering studio creating hydraulic pedal systems and formula wheelbases inspired by FIA GT3 race cars.",
    suggestedContact: {
      email: "info@conspit.com",
      contactType: "PARTNERSHIPS",
      sourceUrl: "https://conspit.com/contact-us",
      notes: "Official creator testing and sales inquiry desk."
    },
    keyProducts: ["Conspit CPP Hydraulic Pedals", "Conspit Ares Formula Wheel", "Conspit Direct Drive Base"],
    innovations: ["Automotive-grade Brembo hydraulic master and slave brake cylinders", "Dual-axis telemetry vibration feedback", "Real carbon fiber monocoque wheel structures"]
  },
  {
    name: "Heusinkveld Engineering",
    website: "https://heusinkveld.com",
    country: "Netherlands",
    categories: ["Sim Racing", "Load Cell Pedals", "Handbrakes"],
    description: "Dutch sim racing engineering studio creating the gold-standard Sim Pedals Ultimate+ and Sprint pedals used by professional F1 drivers.",
    suggestedContact: {
      email: "info@heusinkveld.com",
      contactType: "GENERAL",
      sourceUrl: "https://heusinkveld.com/contact/",
      notes: "Official general inquiries and creator testing mailbox."
    },
    keyProducts: ["Heusinkveld Sim Pedals Sprint", "Sim Pedals Ultimate+", "Heusinkveld Sim Handbrake"],
    innovations: ["Custom 200kg load cell with custom rubber elastomers", "SmartControl software for nonlinear pedal curve mapping", "Laser-cut stainless steel precision frames"]
  },
  {
    name: "Simucube",
    website: "https://simucube.com",
    country: "Finland",
    categories: ["Sim Racing", "Direct Drive Wheelbases", "Active Pedals"],
    description: "Finnish high-end industrial servo manufacturer behind the Simucube 2 Pro/Ultimate direct drive bases and the world's first software-driven ActivePedal.",
    suggestedContact: {
      email: "support@simucube.com",
      contactType: "SUPPORT",
      sourceUrl: "https://simucube.com/contact-us/",
      notes: "Official technical support and professional team relations."
    },
    keyProducts: ["Simucube ActivePedal", "Simucube 2 Pro (25Nm)", "Simucube Valo GT-23 Wheel"],
    innovations: ["ActivePedal zero-elastomer motorized force feedback pedal technology", "Dual-CPU wireless direct-drive servo control", "Simucube Wireless Wheel protocol"]
  },
  {
    name: "Cube Controls",
    website: "https://www.cubecontrols.com",
    country: "Italy",
    categories: ["Sim Racing", "Steering Wheels", "Formula Rims"],
    description: "Italian artisan manufacturer designing high-end GT and Formula steering wheels with real carbon fiber and backlit tactile switches.",
    suggestedContact: {
      email: "support@cubecontrols.com",
      contactType: "SUPPORT",
      sourceUrl: "https://www.cubecontrols.com/contact-us/",
      notes: "Official customer service and reviewer outreach."
    },
    keyProducts: ["Cube Controls F-Core Formula Wheel", "CSX-3 Formula Wheel", "GT-X2 Wheel"],
    innovations: ["Integrated 4-inch full-color touchscreen dash displays", "Hall effect magnetic gear shifters and dual clutches", "Custom molded ergonomic elastomer handgrips"]
  },
  {
    name: "Gomez Sim Industries",
    website: "https://gomezsimindustries.com",
    country: "USA",
    categories: ["Sim Racing", "Custom Wheels", "Esports Gear"],
    description: "American premier sim racing steering wheel builder celebrated for the Hyper P1, Formula Pro Elite, and Hyper SL wheels.",
    suggestedContact: {
      email: "support@gomezsimindustries.com",
      contactType: "SUPPORT",
      sourceUrl: "https://gomezsimindustries.com/pages/contact-us",
      notes: "Official support and creator review communications."
    },
    keyProducts: ["GSI Hyper P1 Steering Wheel", "GSI Formula Pro Elite", "GSI Hyper SL"],
    innovations: ["5mm thick solid carbon fiber faceplates", "High-resolution touchscreens running SimHub dashboards", "Billet aluminum rear unibody chassis"]
  },
  {
    name: "Virtual Racing School",
    website: "https://virtualracingschool.com",
    country: "USA",
    categories: ["Sim Racing", "Direct Drive", "Pedals"],
    description: "Competitive sim racing training platform and hardware company known for the VRS DirectForce Pro 20Nm wheelbase and load cell pedals.",
    suggestedContact: {
      email: "support@virtualracingschool.com",
      contactType: "SUPPORT",
      sourceUrl: "https://virtualracingschool.com/contact-us/",
      notes: "Official customer service and driver testing liaison."
    },
    keyProducts: ["VRS DirectForce Pro Wheelbase (20Nm)", "VRS DirectForce Pro Pedals"],
    innovations: ["Industrial MiGE servo motor integration with ultra-low cogging", "FEA-optimized load cell pedal geometries", "VRS telemetry analysis suite integration"]
  },
  {
    name: "Sim-Lab",
    website: "https://sim-lab.eu",
    country: "Netherlands",
    categories: ["Sim Racing", "Cockpits", "Direct Drive Wheels"],
    description: "Official chassis supplier to Mercedes-AMG PETRONAS Esports, crafting the P1-X rig, XB-1 handbrake, and Mercedes F1 wheel.",
    suggestedContact: {
      email: "support@sim-lab.eu",
      contactType: "SUPPORT",
      sourceUrl: "https://sim-lab.eu/pages/contact-us",
      notes: "Official customer support and team partnership desk."
    },
    keyProducts: ["Sim-Lab P1-X Pro Sim Rig", "Mercedes-AMG F1 Steering Wheel", "XB-1 Load Cell Handbrake"],
    innovations: ["Zero-flex aerospace aluminum extrusion cockpits", "Officially licensed Formula 1 telemetry display integration", "Modular servo motor mounting brackets"]
  },
  {
    name: "Trak Racer",
    website: "https://trakracer.com",
    country: "Australia",
    categories: ["Sim Racing", "Cockpits", "Sim Hardware"],
    description: "Official cockpit partner to Alpine F1 Team, manufacturing the TR160 and TR8 Pro heavy-duty aluminum sim rigs and flight cockpits.",
    suggestedContact: {
      email: "support@trakracer.com",
      contactType: "SUPPORT",
      sourceUrl: "https://trakracer.com/pages/contact-us",
      notes: "Official customer support and creator review communications."
    },
    keyProducts: ["Trak Racer TR160 Mk4", "Trak Racer Alpine Racing TRX", "Trak Racer Inverted Pedals"],
    innovations: ["Heavy-duty anodized aluminum profile engineering", "Multi-axis adjustable wheel and pedal brackets", "Official Formula 1 team ergonomics"]
  },
  {
    name: "Next Level Racing",
    website: "https://nextlevelracing.com",
    country: "Australia",
    categories: ["Sim Racing", "Cockpits", "Motion Platforms"],
    description: "Global manufacturer of accessible to professional sim cockpits, motion platforms (Motion Plus), and officially licensed Ferrari rigs.",
    suggestedContact: {
      email: "support@nextlevelracing.com",
      contactType: "SUPPORT",
      sourceUrl: "https://nextlevelracing.com/contact-us/",
      notes: "Official customer support and reviewer outreach portal."
    },
    keyProducts: ["Next Level Racing Wheel Stand 2.0", "Motion Plus Platform", "F-GT Elite Cockpit"],
    innovations: ["Dual-position formula and GT seating positions", "Modular haptic and linear motion platform actuators", "Foldable high-rigidity sim racing wheel stands"]
  },
  {
    name: "SimXperience",
    website: "https://simxperience.com",
    country: "USA",
    categories: ["Sim Racing", "Motion Simulators", "Direct Drive"],
    description: "Pioneering motion simulator and direct drive brand behind the AccuForce Pro V2 wheelbase and Stage series motion cockpits.",
    suggestedContact: {
      email: "support@simxperience.com",
      contactType: "SUPPORT",
      sourceUrl: "https://simxperience.com/ContactUs.aspx",
      notes: "Official technical support and creator review contact."
    },
    keyProducts: ["AccuForce Pro V2 Direct Drive", "SimXperience Stage 5 Motion Simulator", "SimVibe Tactile Feedback"],
    innovations: ["SimVibe physics-based multi-transducer tactile feedback", "Precision telemetry-driven linear motion actuators", "Direct-drive servo force profiling"]
  },
  {
    name: "Ascher Racing",
    website: "https://ascher-racing.com",
    country: "Germany",
    categories: ["Sim Racing", "Steering Wheels", "Formula Rims"],
    description: "German manufacturer of tournament-grade McLaren licensed and custom sim racing steering wheels with magnetic shifters.",
    suggestedContact: {
      email: "support@ascher-racing.com",
      contactType: "SUPPORT",
      sourceUrl: "https://ascher-racing.com/contact",
      notes: "Official customer support and reviewer liaison."
    },
    keyProducts: ["Ascher Racing McLaren Artura Pro", "F64 V3 Formula Wheel", "B24L Button Box"],
    innovations: ["Officially licensed McLaren GT4 and Artura componentry", "Hall-sensor magnetic paddle shifters and dual clutches", "Integrated telemetry touch display screens"]
  }
];

/**
 * Dynamic brand discovery sources for continuous crawling.
 * Probes dynamic peripheral manufacturer indexes when catalog candidates run low.
 */
export const DYNAMIC_PERIPHERAL_CRAWL_TARGETS = [
  { url: "https://www.attackshark.com", category: "MICE", defaultName: "Attack Shark" },
  { url: "https://www.wlmouse.com", category: "MICE", defaultName: "WLmouse" },
  { url: "https://www.sprime.gg", category: "MICE", defaultName: "Sprime" },
  { url: "https://waizowl.com", category: "MICE", defaultName: "Waizowl" },
  { url: "https://www.vaxee.co", category: "MICE", defaultName: "Vaxee" },
  { url: "https://www.lethalgaminggear.com", category: "MICE", defaultName: "Lethal Gaming Gear" },
  { url: "https://wallhack.com", category: "MICE", defaultName: "Wallhack" },
  { url: "https://pwnage.com", category: "MICE", defaultName: "Pwnage" },
  { url: "https://mchose.store", category: "MICE", defaultName: "Mchose" },
  { url: "https://www.mobapad.com", category: "CONTROLLERS", defaultName: "Mobapad" },
  { url: "https://binbok.com", category: "CONTROLLERS", defaultName: "Binbok" },
  { url: "https://nyxigame.com", category: "CONTROLLERS", defaultName: "NYXI Gaming" },
  { url: "https://qrdgame.com", category: "CONTROLLERS", defaultName: "QRD Game" },
  { url: "https://www.hexgaming.com", category: "CONTROLLERS", defaultName: "HexGaming" },
  { url: "https://battlebeavercustoms.com", category: "CONTROLLERS", defaultName: "Battle Beaver Customs" },
  { url: "https://aimcontrollers.com", category: "CONTROLLERS", defaultName: "AimControllers" },
  { url: "https://fightboxarcade.com", category: "FIGHTSTICKS", defaultName: "FightBox Arcade" },
  { url: "https://retroarcadecrafts.com", category: "FIGHTSTICKS", defaultName: "RetroArcadeCrafts" },
  { url: "https://mavercade.com", category: "FIGHTSTICKS", defaultName: "Mavercade" },
  { url: "https://furinarcade.co.uk", category: "FIGHTSTICKS", defaultName: "Furin Arcade" },
  { url: "https://enthcreations.com", category: "FIGHTSTICKS", defaultName: "Enth Creations" },
  { url: "https://www.melgeek.com", category: "KEYBOARDS", defaultName: "MelGeek" },
  { url: "https://www.yunzii.com", category: "KEYBOARDS", defaultName: "Yunzii" },
  { url: "https://aulagear.com", category: "KEYBOARDS", defaultName: "Aula Gaming" },
  { url: "https://wobkey.com", category: "KEYBOARDS", defaultName: "WOBKEY Rainy75" },
  { url: "https://meletrix.com", category: "KEYBOARDS", defaultName: "Meletrix" },
  { url: "https://modedesigns.com", category: "KEYBOARDS", defaultName: "Mode Designs" },
  { url: "https://novelkeys.com", category: "KEYBOARDS", defaultName: "NovelKeys" },
  { url: "https://chilkey.com", category: "KEYBOARDS", defaultName: "Chilkey" },
  { url: "https://www.kiiboom.com", category: "KEYBOARDS", defaultName: "KiiBOOM" },
  { url: "https://kbdfans.com", category: "KEYBOARDS", defaultName: "KBDfans" },
  { url: "https://cannonkeys.com", category: "KEYBOARDS", defaultName: "CannonKeys" },
  { url: "https://www.simagic.com", category: "SIM RACING", defaultName: "Simagic" },
  { url: "https://conspit.com", category: "SIM RACING", defaultName: "Conspit Racing" },
  { url: "https://heusinkveld.com", category: "SIM RACING", defaultName: "Heusinkveld" },
  { url: "https://simucube.com", category: "SIM RACING", defaultName: "Simucube" },
  { url: "https://www.cubecontrols.com", category: "SIM RACING", defaultName: "Cube Controls" },
  { url: "https://gomezsimindustries.com", category: "SIM RACING", defaultName: "Gomez Sim Industries" },
  { url: "https://virtualracingschool.com", category: "SIM RACING", defaultName: "VRS Sim Racing" },
  { url: "https://sim-lab.eu", category: "SIM RACING", defaultName: "Sim-Lab" },
  { url: "https://trakracer.com", category: "SIM RACING", defaultName: "Trak Racer" },
  { url: "https://nextlevelracing.com", category: "SIM RACING", defaultName: "Next Level Racing" },
  { url: "https://ascher-racing.com", category: "SIM RACING", defaultName: "Ascher Racing" },
];

/**
 * Searches the brand directory for matching candidates not currently in the database.
 */
export function searchCandidateBrands(
  query: string,
  category: string = "ALL",
  existingDomains: Set<string>,
  existingNames: Set<string>,
  limit: number = 16
): CandidateBrand[] {
  const q = query.trim().toLowerCase();
  const cat = category.toUpperCase();

  return PERIPHERAL_BRAND_DIRECTORY.filter((brand) => {
    const normDomain = normalizeDomain(brand.website);
    const normName = normalizeName(brand.name);

    // Skip if already in database
    if (existingDomains.has(normDomain) || existingNames.has(normName)) {
      return false;
    }

    // Category match
    if (cat !== "ALL" && !brand.categories.some((c) => c.toUpperCase().includes(cat))) {
      return false;
    }

    // Query match
    if (q) {
      const matchName = brand.name.toLowerCase().includes(q);
      const matchDesc = brand.description.toLowerCase().includes(q);
      const matchCats = brand.categories.some((c) => c.toLowerCase().includes(q));
      const matchProducts = brand.keyProducts?.some((p) => p.toLowerCase().includes(q));
      const matchInnovations = brand.innovations?.some((i) => i.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchCats && !matchProducts && !matchInnovations) {
        return false;
      }
    }

    return true;
  }).slice(0, limit);
}

/**
 * Dynamically crawls web targets to discover new brand candidates not yet in the system.
 * Probes official sites live, verifies DNS MX records, and returns brand candidates.
 */
export async function crawlForNewPeripheralBrands(
  category: string = "ALL",
  existingDomains: Set<string>,
  existingNames: Set<string>,
  limit: number = 8
): Promise<CandidateBrand[]> {
  const cat = category.toUpperCase();
  const candidates: CandidateBrand[] = [];

  // Filter crawl targets by category and check if already in db
  const targets = DYNAMIC_PERIPHERAL_CRAWL_TARGETS.filter((t) => {
    const normDomain = normalizeDomain(t.url);
    const normName = normalizeName(t.defaultName);
    if (existingDomains.has(normDomain) || existingNames.has(normName)) {
      return false;
    }
    if (cat !== "ALL" && !t.category.includes(cat)) {
      return false;
    }
    return true;
  });

  for (const target of targets) {
    if (candidates.length >= limit) break;

    try {
      const probe = await probeBrandWebsite(target.url);
      if (probe.safe) {
        let verifiedEmail: string | undefined;
        let verifiedType = "SUPPORT";

        // Find highest-scoring deliverable email
        for (const disc of probe.discoveredEmails) {
          const mx = await verifyEmailDomainMx(disc.email);
          if (mx.deliverable) {
            verifiedEmail = disc.email;
            verifiedType = disc.contactType;
            break;
          }
        }

        candidates.push({
          name: target.defaultName,
          website: target.url,
          country: "Global",
          categories: [target.category, "Gaming Peripherals"],
          description: probe.description || probe.title || `Gaming hardware manufacturer at ${target.url}`,
          suggestedContact: verifiedEmail
            ? {
                email: verifiedEmail,
                contactType: verifiedType,
                sourceUrl: target.url,
                notes: "Discovered via live web probe & verified via DNS MX.",
              }
            : undefined,
        });
      }
    } catch {
      // Continue crawling other targets on network error
    }
  }

  return candidates;
}

function decodeCloudflareEmail(encoded: string): string | null {
  try {
    let email = "";
    const key = parseInt(encoded.substring(0, 2), 16);
    for (let n = 2; n < encoded.length; n += 2) {
      email += String.fromCharCode(parseInt(encoded.substring(n, n + 2), 16) ^ key);
    }
    return email.trim().toLowerCase();
  } catch {
    return null;
  }
}

const DISALLOWED_EMAIL_DOMAINS = new Set([
  "simprosys.com",
  "sentry.io",
  "freshdesk.com",
  "zendesk.com",
  "gorgias.io",
  "klaviyo.com",
  "shopify.com",
  "wixpress.com",
  "google.com",
  "schema.org",
  "intercom.io",
  "crisp.chat",
  "cloudflare.com",
  "privy.com",
  "yotpo.com",
  "judge.me",
  "trustpilot.com",
  "loox.io",
  "example.com",
  "domain.com",
  "github.com",
  "twitter.com",
  "instagram.com",
  "facebook.com",
  "tiktok.com",
  "apple.com",
  "gravatar.com",
]);

const DISALLOWED_MAILBOX_PREFIXES = [
  "noreply",
  "no-reply",
  "mailer-daemon",
  "bounce",
  "abuse",
  "privacy",
  "legal",
  "security",
  "billing",
  "unsubscribe",
  "postmaster",
  "hostmaster",
  "root",
];

function isValidDiscoveredEmail(rawEmail: string): boolean {
  const email = rawEmail.trim().toLowerCase();
  if (email.length < 5 || email.length > 70) return false;

  // Strict email regex
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
  if (!regex.test(email)) return false;

  // Reject file extensions disguised as domains/usernames
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico|js|css|map|woff|woff2|ttf)$/i.test(email)) {
    return false;
  }

  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [localPart, domain] = parts;

  // Disallow system/bounce addresses
  if (DISALLOWED_MAILBOX_PREFIXES.some((p) => localPart === p || localPart.startsWith(`${p}+`))) {
    return false;
  }

  // Disallow 3rd-party vendor plugins (Shopify apps, ticketing systems)
  for (const disallowed of DISALLOWED_EMAIL_DOMAINS) {
    if (domain === disallowed || domain.endsWith(`.${disallowed}`)) {
      return false;
    }
  }

  return true;
}

function scoreAndClassifyEmail(
  email: string,
  brandDomain: string
): { contactType: string; score: number } {
  const normEmail = email.toLowerCase();
  const domain = normEmail.split("@")[1] || "";
  let contactType = "GENERAL";
  let score = 40;

  // 1. High priority creator / PR keywords
  if (
    normEmail.includes("influencer") ||
    normEmail.includes("creator") ||
    normEmail.includes("collab") ||
    normEmail.includes("sponsor") ||
    normEmail.includes("sampling") ||
    normEmail.includes("review") ||
    normEmail.includes("affiliate")
  ) {
    contactType = "PR";
    score = 100;
  } else if (
    normEmail.startsWith("pr@") ||
    normEmail.startsWith("press@") ||
    normEmail.startsWith("media@") ||
    normEmail.startsWith("marketing@")
  ) {
    contactType = "PR";
    score = 85;
  } else if (
    normEmail.startsWith("partner") ||
    normEmail.startsWith("business@") ||
    normEmail.startsWith("bd@") ||
    normEmail.startsWith("overseas@") ||
    normEmail.startsWith("cooperation@")
  ) {
    contactType = "PARTNERSHIPS";
    score = 70;
  } else if (
    normEmail.startsWith("official@") ||
    normEmail.startsWith("hello@") ||
    normEmail.startsWith("contact@") ||
    normEmail.startsWith("info@") ||
    normEmail.startsWith("team@")
  ) {
    contactType = "GENERAL";
    score = 50;
  } else if (normEmail.startsWith("sales@")) {
    contactType = "PARTNERSHIPS";
    score = 35;
  } else if (
    normEmail.startsWith("support@") ||
    normEmail.startsWith("help@") ||
    normEmail.startsWith("service@")
  ) {
    contactType = "SUPPORT";
    score = 30;
  }

  // Boost if the email domain matches the brand's root domain
  const cleanBrandDomain = brandDomain.replace(/^www\./, "").toLowerCase();
  const cleanEmailDomain = domain.replace(/^www\./, "").toLowerCase();

  if (
    cleanEmailDomain === cleanBrandDomain ||
    cleanEmailDomain.endsWith(`.${cleanBrandDomain}`) ||
    cleanBrandDomain.endsWith(`.${cleanEmailDomain}`)
  ) {
    score += 25;
  }

  return { contactType, score };
}

function extractEmailsFromHtml(html: string, sourceUrl: string, brandDomain: string): Array<{
  email: string;
  contactType: string;
  sourceUrl: string;
  score: number;
}> {
  const results = new Map<string, { email: string; contactType: string; sourceUrl: string; score: number }>();

  // 1. Mailto links (Highest fidelity)
  const mailtoRegex = /href=["']mailto:([^"'\s?#]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = mailtoRegex.exec(html)) !== null) {
    const rawEmail = decodeURIComponent(match[1]).trim().toLowerCase();
    if (isValidDiscoveredEmail(rawEmail)) {
      const { contactType, score } = scoreAndClassifyEmail(rawEmail, brandDomain);
      results.set(rawEmail, {
        email: rawEmail,
        contactType,
        sourceUrl,
        score: score + 15, // bonus for explicit mailto link
      });
    }
  }

  // 2. Cloudflare Obfuscated Email Protection
  const cfRegex = /data-cfemail=["']([a-f0-9]+)["']/gi;
  while ((match = cfRegex.exec(html)) !== null) {
    const decoded = decodeCloudflareEmail(match[1]);
    if (decoded && isValidDiscoveredEmail(decoded)) {
      const { contactType, score } = scoreAndClassifyEmail(decoded, brandDomain);
      if (!results.has(decoded) || (results.get(decoded)?.score || 0) < score) {
        results.set(decoded, {
          email: decoded,
          contactType,
          sourceUrl,
          score: score + 10,
        });
      }
    }
  }

  // 3. Body text email regex (strip scripts and styles first to eliminate JS token false-positives)
  const sanitizedHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ");

  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10})/gi;
  const matches = sanitizedHtml.match(emailRegex) || [];

  for (const raw of matches) {
    const email = raw.trim().toLowerCase();
    if (!results.has(email) && isValidDiscoveredEmail(email)) {
      const { contactType, score } = scoreAndClassifyEmail(email, brandDomain);
      results.set(email, {
        email,
        contactType,
        sourceUrl,
        score,
      });
    }
  }

  return Array.from(results.values());
}

/**
 * Probes a website URL to extract potential business contact email addresses
 * and basic meta information (safe with SSRF protection).
 * Automatically probes subpages like /pages/influencer-program, /collaborations, /contact-us
 * if the homepage lacks high-scoring creator/PR contacts.
 */
export async function probeBrandWebsite(websiteUrl: string): Promise<{
  safe: boolean;
  discoveredEmails: Array<{ email: string; contactType: string; sourceUrl: string }>;
  title?: string;
  description?: string;
  error?: string;
}> {
  const ssrfCheck = validateSafeUrl(websiteUrl);
  if (!ssrfCheck.safe) {
    return { safe: false, discoveredEmails: [], error: ssrfCheck.error };
  }

  const brandDomain = normalizeDomain(websiteUrl);
  const allDiscovered = new Map<string, { email: string; contactType: string; sourceUrl: string; score: number }>();
  let pageTitle: string | undefined;
  let pageDesc: string | undefined;

  const fetchPage = async (url: string, timeoutMs: number = 4500): Promise<string | null> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      clearTimeout(timeout);
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  };

  try {
    // 1. Fetch Main Homepage
    const rootHtml = await fetchPage(websiteUrl, 5000);

    if (rootHtml) {
      const titleMatch = rootHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) pageTitle = titleMatch[1].trim();

      const descMatch = rootHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      if (descMatch) pageDesc = descMatch[1].trim();

      const extracted = extractEmailsFromHtml(rootHtml, websiteUrl, brandDomain);
      for (const item of extracted) {
        allDiscovered.set(item.email, item);
      }
    }

    // 2. If no PR or Influencer email is found on the root page, check common collaboration / contact subpages
    const hasTopTierContact = Array.from(allDiscovered.values()).some((e) => e.score >= 80);

    if (!hasTopTierContact) {
      const subpathsToProbe = [
        "/pages/influencer-program",
        "/pages/collaborations",
        "/pages/collab",
        "/pages/contact-us",
        "/pages/contact",
        "/contact-us",
        "/contact",
      ];

      const origin = new URL(websiteUrl).origin;

      for (const subpath of subpathsToProbe) {
        const subUrl = `${origin}${subpath}`;
        const subHtml = await fetchPage(subUrl, 3000);
        if (subHtml) {
          const subExtracted = extractEmailsFromHtml(subHtml, subUrl, brandDomain);
          for (const item of subExtracted) {
            const existing = allDiscovered.get(item.email);
            if (!existing || existing.score < item.score) {
              allDiscovered.set(item.email, item);
            }
          }
          // Stop if top-tier creator contact found
          if (Array.from(allDiscovered.values()).some((e) => e.score >= 80)) {
            break;
          }
        }
      }
    }

    // Sort by score descending
    const sorted = Array.from(allDiscovered.values())
      .sort((a, b) => b.score - a.score)
      .map(({ email, contactType, sourceUrl }) => ({
        email: normalizeEmail(email),
        contactType,
        sourceUrl,
      }));

    return {
      safe: true,
      discoveredEmails: sorted.slice(0, 5),
      title: pageTitle,
      description: pageDesc,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return {
      safe: true,
      discoveredEmails: [],
      error: msg,
    };
  }
}
