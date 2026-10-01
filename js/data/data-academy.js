/*
  data-academy.js — the HAND-CURATED Academy question bank.
  Every question, wrong answer, and explanation here was written by hand
  from the guide data (no auto-generated options). Plain objects so
  non-programmers can edit.

  q(prompt, correct, [three wrong answers], explanation)
*/
window.DSA_ACADEMY = (function () {
  function q(prompt, correct, wrong, explain) {
    return { prompt: prompt, correct: correct, wrong: wrong, explain: explain || "" };
  }

  /* ---- Chapter 2: Formation lab (12 kept of 27 replays) ---- */
  var formationLab = [
    { scenarioId: "scn-marine-clump-baneling", questions: [
      q("Your Marine ball just met Banelings and storm. What fixes the next wave?",
        "Spread Marauders — they soak the same hits and keep fighting",
        ["A bigger Marine ball — volume beats splash", "Add Medivacs and heal through it", "Rush Battlecruisers immediately"],
        "A clump is one big AoE target. Marauder HP spread out means each Baneling trades into one unit, not ten."),
      q("Why do Banelings and storm farm a clump for free value?",
        "Every AoE hit lands on the whole group at once — full value per cast",
        ["Banelings outrange Marines", "Marines cannot damage Banelings", "Storm makes Banelings attack faster"],
        "AoE damage is priced on hitting one or two units. A clump lets it hit ten.") ] },

    { scenarioId: "scn-hydra-storm-buffer", questions: [
      q("High Templar are storming your Hydras. What is the fix?",
        "Roach buffer in front + Hydras spread far back",
        ["More Hydras, packed tighter for focus fire", "Pure Queens for the heals", "Rush Ultras and walk through the storms"],
        "Storm value comes from clumps. The buffer makes each storm land on cheap Roach HP."),
      q("What does the Roach buffer actually do?",
        "Storm and frontline damage land on cheap Roach HP instead of your damage units",
        ["Roaches block storm from being cast", "Roaches heal the Hydras behind them", "It forces the Templar to retreat"],
        "Buffers do not stop the spell — they make it hit the wrong (cheap) target.") ] },

    { scenarioId: "scn-fungal-spacing", questions: [
      q("Infestors keep fungaling your Marines. Same eight Marines — what decides the damage?",
        "Your spacing before the cast — spaced rows instead of one ball",
        ["Marine upgrade level", "How fast you click during the fight", "Whether Medivacs are nearby"],
        "Fungal is aimed at clumps. The formation you set BEFORE the round decides its value."),
      q("Best Terran addition against Infestors (from the guide)?",
        "Ghost + Liberator",
        ["More Marines", "Widow Mines inside your own ball", "An early Battlecruiser"],
        "Adding more Marines adds more fungal food. Ghost and Liberator punish the caster instead.") ] },

    { scenarioId: "scn-archon-starvation", questions: [
      q("Archons are eating your Zerg wave. What starves them?",
        "Hydras at max range behind spread Roaches",
        ["Ling/Bane flood into their front", "Clumped Hydras for focus fire", "Queens to out-heal the splash"],
        "Archons feast on cheap clumped units. Range denial gives the splash nothing worth hitting."),
      q("Why do Zerglings and Banelings feed Archons?",
        "Cheap clumped units give the splash full value on every swing",
        ["They move too slowly to reach the fight", "Archon shields regenerate from kills", "They block your Roach pathing"],
        "Donating clumped 20-45 mineral units to splash is paying the Archon to win.") ] },

    { scenarioId: "scn-lib-overbuild-stalkers", questions: [
      q("Three early Liberators feel great. What is the actual risk?",
        "They starve your ground wave — enough Stalkers shoot them down for free",
        ["Liberators cannot attack ground at all", "They arrive too late to matter", "Stalkers outrange sieged Liberators"],
        "Liberators are strong, but three too early means a thin ground wave and free Stalker value."),
      q("The better opener from the replay?",
        "One Liberator + a real ground core",
        ["Five Liberators, minimal ground", "Zero Liberators, ever", "Skip ground and rush Battlecruisers"],
        "Air support works when the ground wave underneath it still holds.") ] },

    { scenarioId: "scn-ling-thor-surround", questions: [
      q("Enemy Thors are tanking your Roach/Hydra/Queen wave. The answer from the guide?",
        "Zergling flood + Hydra core — wrap around the line",
        ["More Roaches — armor beats armor", "Pure Queens and transfuse through it", "Mass Banelings into their front"],
        "Roach, Hydra and Queen all feed Thors. Lings surround and delete them on cost."),
      q("Why do Zerglings beat Thors on value?",
        "20-mineral units surround and kill a 425-mineral unit",
        ["Lings deal bonus damage to mechanical", "Thors cannot attack ground", "Lings are immune to splash"],
        "It is a mineral trade: a full surround of Lings costs a fraction of one Thor.") ] },

    { scenarioId: "scn-ghost-ultra-trap", questions: [
      q("Ultras are charging your bio. Ghost snipe feels like the designed answer. What actually holds?",
        "Siege Tanks behind spread Marauders",
        ["Mass Ghosts — snipe scales up", "Clumped Marines for maximum DPS", "Widow Mines in front of everything"],
        "The intuitive counter is the trap: the charge reaches your clump before snipes finish the job."),
      q("What is the lesson behind the trap?",
        "The counter that FEELS designed for a threat is not always what holds the line",
        ["Ghosts cannot target Ultralisks", "Ultras are immune to ranged damage", "Snipe costs too much energy to use"],
        "Test what actually stops the charge — tank lines and spread HP, not the flashy ability.") ] },

    { scenarioId: "scn-queen-drain", questions: [
      q("The enemy Queen line keeps un-doing your damage. What is the fix?",
        "One Ghost drains the heal energy + a Liberator zones the rest",
        ["More Marines — out-DPS the healing", "Add Medivacs and out-heal them back", "Ignore the Queens and target the cannon"],
        "Transfuse quietly refunds every fight. Kill the energy, not the HP."),
      q("Why did the bad pass fail?",
        "Every wave's damage got quietly healed back between fights",
        ["Queens outranged the Marines", "Marines cannot hit biological units", "The Queens gained bounty each round"],
        "If their HP is back before the next round, your DPS was rented, not spent.") ] },

    { scenarioId: "scn-immortal-overbuild-pvz", questions: [
      q("A Roach wave is incoming. Mass Immortals feels obvious. The guide's line?",
        "One Immortal, one Templar, and a wall of Zealots",
        ["Six Immortals — the hard counter, but harder", "Mass Adepts for the shades", "Skip ground and rush Carriers"],
        "Immortals get overbuilt — then the Hydras arrive. Zealot HP per mineral carries the fight."),
      q("Why does the Zealot wall work?",
        "Cheap HP soaks in front while a little splash and single-target damage kill from behind",
        ["Zealots deal bonus damage to armored", "Roaches cannot attack melee units", "Zealots are immune to fungal"],
        "The overbuilt counter unit is minerals you needed in HP and coverage.") ] },

    { scenarioId: "scn-collos-viper-abduct", questions: [
      q("You own Colossi. They just added Vipers. What now?",
        "Stop adding Colossi — keep what you have, add Templar drain and Stalkers",
        ["Add more Colossi to outrange the Vipers", "Sell every Colossus instantly at any loss", "Mass Phoenix to lift the Vipers away"],
        "Keep the value you own, deny the value they want."),
      q("Why is each EXTRA Colossus a liability now?",
        "Every new Colossus is an abduct waiting to happen — free value for their Viper",
        ["Vipers deal bonus damage to mechanical", "Colossi lose range near Vipers", "Extra Colossi cost double after minute 8"],
        "You are buying 300-mineral snacks for a 200-mineral unit.") ] },

    { scenarioId: "scn-bc-team-response", questions: [
      q("Enemy Battlecruisers are online. The Zerg half of the team answer?",
        "Hydra rows with Corruptors sprinkled in, then Viper parasitic bomb",
        ["Pure ground — flood more Roaches", "Queens only — transfuse through it", "Swarm Hosts — free units win eventually"],
        "Pure ground feeds BCs. Hydra + Corruptor holds while the Viper bomb swings it."),
      q("What loses to Battlecruisers the fastest?",
        "Staying pure ground and letting a BC leak into your teammate",
        ["Adding Corruptors too early", "Upgrading Hydra range first", "Warning your teammates too soon"],
        "A leaked BC can split a teammate's wave and lose the game. Anti-air is a team job.") ] },

    { scenarioId: "scn-archon-spine-pvp", questions: [
      q("PvP mirror. What wins the long fight?",
        "Archons in front, Zealot feed, one Immortal",
        ["Stalker/Adept mass — range plus blink", "Double Disruptor with no frontline", "Pure Void Rays"],
        "The mirror is an HP contest. The glass cannon folds to Archon splash."),
      q("Why does Stalker/Adept mass fold in the mirror?",
        "Low-HP units melt to Archon splash — the mirror rewards HP per mineral",
        ["Stalkers cannot hit Archons", "Blink is disabled in mirror matchups", "Adepts refund minerals when they die"],
        "Damage stats do not matter if your army evaporates first.") ] }
  ];

  /* ---- Chapters 3-5: Threat mastery (20 kept of 54 rows) ---- */
  var threats = {
    Zerg: [
      { rowId: "lurker__zerg", questions: [
        q("ZvZ: enemy Lurkers are up. The core rule?",
          "Whoever has more Lurkers wins — match or beat their count ASAP",
          ["Mass Roach trades fine into Lurkers", "Queens out-heal the spines", "Rush Ultras and ignore the Lurker war"],
          "This holds against roach, hydra, ling, queen and ultra armies. Fall behind and the lane dies."),
        q("The #1 way players fail the Lurker war?",
          "Ignoring air — the enemy kills your detection and your Lurkers go blind",
          ["Building Corruptors too early", "Overspending on Zerglings", "Matching their Lurker count too fast"],
          "95% of Lurker failures: ten Lurkers, dead Overseer, no scan. Corruptors are required.") ] },
      { rowId: "battlecruiser__zerg", questions: [
        q("Battlecruisers hit your Zerg lane. First response?",
          "A row of Hydras immediately, sprinkle in Corruptors, then shift to pure Corruptor",
          ["A Roach wall — tank it out", "Zergling flood underneath them", "Lurkers dug in under the BCs"],
          "Hydras stabilize now; Corruptors finish the job as the count grows."),
        q("Why is a leaking BC a TEAM problem?",
          "A leaked BC can split a teammate's wave and lose the whole game",
          ["BCs heal themselves when they leak", "Leaks reset your upgrades", "It gives the enemy double bounty"],
          "Coordinate anti-air — a BC leak is everyone's emergency.") ] },
      { rowId: "mothership__zerg", questions: [
        q("Enemy Mothership. The guide's move?",
          "Immediately sell a few T1 units to fund the extra Corruptors",
          ["Keep your ground — it trades eventually", "Mass Queens first, Corruptors later", "Rush Brood Lords"],
          "Your day just got ruined. Refinance T1 into Corruptors before the next round."),
        q("Void Rays are escorting the Mothership. What do you add?",
          "Queens to back up the Corruptor flock",
          ["Banelings", "More Roaches", "Lurkers"],
          "Void Rays hunt Corruptors — Queens are the answer to the escort.") ] },
      { rowId: "high-templar__zerg", questions: [
        q("Protoss High Templar are storming your wave. The Zerg fix?",
          "Spread Roaches as a front buffer, Hydras far back and split",
          ["Clump the Hydras to burst the Templar down", "Mass Queens for transfuse", "Go pure Zergling"],
          "Buffers eat the storms, spacing denies the value, small Ling groups bait casts."),
        q("Protoss reaches 5-6 storms. What is true?",
          "There may be no clean Zerg ground answer anymore — deny storm value earlier",
          ["Ultras fully ignore storm", "Queens out-heal any storm count", "Storm cannot hit burrowed units"],
          "Past a storm count, ground alone stops working. Do not let it get there.") ] },
      { rowId: "marine__zerg", questions: [
        q("Mass Marine against your Zerg lane. Best value play?",
          "Infestor fungal ASAP — catch them grouped, back it with Hydras",
          ["Zergling flood into the bullets", "A pure Roach wall", "Rush Brood Lords"],
          "One good fungal on grouped Marines pays for the Infestor several times over.") ] },
      { rowId: "carrier__zerg", questions: [
        q("Enemy Carriers are scaling up. When do you respond?",
          "Before the count gets high — add your anti-air early",
          ["After they have 6+, so you counter them all at once", "Never — ground handles Carriers", "Only when a teammate asks"],
          "Carriers compound. Early anti-air is cheap; late anti-air is a prayer.") ] },
      { rowId: "thor__zerg", questions: [
        q("Enemy Thors anchor their wave. The cheap Zerg answer?",
          "Zergling surround — 20-mineral units deleting a 425-mineral unit",
          ["More Roach, Hydra and Queen into it", "Corruptors — Thors cannot shoot up", "Baneling bombs from the front"],
          "Roach/Hydra/Queen all feed Thors, and Thors DO shoot up. Wrap them instead.") ] }
    ],
    Terran: [
      { rowId: "high-templar__terran", questions: [
        q("Protoss High Templar online against your bio. The Terran line?",
          "Manually positioned Liberators — and stop blind Marine mass",
          ["More Marines, faster", "Widow Mines inside your own clump", "An early Battlecruiser rush"],
          "Liberator zones punish the Templar; Marine mass is exactly what storm wants.") ] },
      { rowId: "hydralisk__terran", questions: [
        q("A Hydra wave is hitting your Terran lane. First fix?",
          "Add Marauders right away; Liberators are the mid-game response",
          ["Mass Marines and win the DPS race", "A Ghost snipe line", "Hellbats in front"],
          "Marauder armor blunts Hydra DPS now; Liberators clean up from above later."),
        q("You went Liberators against Hydra. What must you watch for?",
          "Their Corruptor response — do not ignore it",
          ["Their gas timing", "Their Queen count", "Hydra upgrade levels"],
          "Liberators invite Corruptors. The answer to the answer is your job too.") ] },
      { rowId: "battlecruiser__terran", questions: [
        q("Enemy Battlecruisers. The Terran answer?",
          "Get T3 immediately — Thors wreck BCs",
          ["Marines scale into BCs fine", "Siege Tanks", "Widow Mines"],
          "Thinking you do not need immediate T3 is the classic BC mistake.") ] },
      { rowId: "lurker__terran", questions: [
        q("3+ Lurkers are dug in across the lane. What kills them?",
          "Air — Liberators or Battlecruisers; ground into Lurkers is feeding",
          ["A Marauder charge", "Marines stimming through the spines", "Hellion run-bys"],
          "Thinking ground counters Lurkers is how lanes die. Go over the spines.") ] },
      { rowId: "marine__terran", questions: [
        q("TvT: enemy mass Marine. The guide's line?",
          "Match Marines early; Liberators punish the mass in mid game",
          ["Cyclones and Hellbats", "An early Battlecruiser", "A Ghost opener"],
          "Cyclone and Hellbat are the classic useless-in-TvT trap. Marines now, Libs later.") ] },
      { rowId: "infestor__terran", questions: [
        q("The Roach + Infestor shroud core is grinding your lane down. The Terran counter?",
          "Liberators — zone the shrouded line from above and force them off it",
          ["More Marines into the shroud", "Widow Mines inside your own ball", "Bio-only, but bigger"],
          "Shroud halves ranged damage and eats bio at half price. Liberator zones do the work; keep your bio spaced against fungal.") ] },
      { rowId: "ultralisk__terran", questions: [
        q("Ultras are charging your Terran wave. What holds?",
          "Siege Tanks behind spread Marauders; a few Liberators help",
          ["A clumped Marine/Marauder ball", "Mass Ghost snipe", "Bunkers and nothing else"],
          "Spread Marauders soak the charge, Tanks delete it. Snipe lines get run over.") ] }
    ],
    Protoss: [
      { rowId: "battlecruiser__protoss", questions: [
        q("Battlecruisers against your Protoss lane. The guide's core?",
          "A ton of blink Stalkers maintained all game, plus Tempests",
          ["Void Rays, Archons and Carriers", "Mass Zealots", "Photon-cannon turtle"],
          "Void Ray/Archon/Carrier is the listed trap. Stalker volume + Tempest range wins."),
        q("Why does a leaked BC demand team coordination?",
          "One leak can split a teammate's wave and lose the game outright",
          ["BCs regenerate faster while leaking", "Leaks disable your warp-ins", "It doubles their income"],
          "Anti-air against BCs is not optional and not solo.") ] },
      { rowId: "archon__protoss", questions: [
        q("PvP: their Archon spine is winning. The answer?",
          "Your own Archons + Disruptors",
          ["Void Rays", "Mass Adepts", "A pure Zealot flood"],
          "The high-HP Archon is the backbone of the mirror. Match it, then vaporize theirs."),
        q("The Disruptor rule from the data?",
          "Do not oversaturate — there is only so much ground to vaporize",
          ["You can never have too many", "They work best clumped inside your army", "Only build them after storm"],
          "Highly volatile, decisive results — a couple is a weapon, six is a liability.") ] },
      { rowId: "disruptor__protoss", questions: [
        q("Enemy Disruptors are deleting your ground. What is true?",
          "Mirror them, but do not overbuild — novas are volatile and ground is finite",
          ["A Zealot flood absorbs novas for free", "Stalkers outrange novas, so mass them", "Sell all ground for air instantly"],
          "Trade nova for nova, keep your count sane, and do not donate clumps.") ] },
      { rowId: "thor__protoss", questions: [
        q("A Thor bank appears against your Protoss lategame. Why is it scary, and what answers it?",
          "Thors punish your air-reliant lategame — Immortals are the ground answer",
          ["Add more Carriers, Mothership and Tempest into it", "A Zealot flood", "Phoenix — lift the Thors away"],
          "Protoss lategame leans on Mothership/Carrier, exactly what Thors punish. Phoenix cannot lift massive units.") ] },
      { rowId: "mothership__protoss", questions: [
        q("The enemy Mothership arrives. Your line?",
          "Your own Mothership plan plus Carriers; Tempests help but do not overbuild them",
          ["Mass Void Rays only", "All-in ground with Immortals", "Ten Tempests"],
          "Neck and neck now — your Mothership should already be in the plan. Overbuilt Tempests is the listed trap.") ] },
      { rowId: "raven__protoss", questions: [
        q("An enemy Raven is matrixing your key units. The play?",
          "Phoenix up front to eat the interference matrix, Void Rays or Stalkers behind",
          ["Ignore it — matrix wears off", "Add more Archons first", "Mass Observers"],
          "Matrix can disable an Archon, Immortal or Mothership at the worst moment. Feed it a Phoenix instead.") ] }
    ]
  };

  return { formationLab: formationLab, threats: threats };
})();
