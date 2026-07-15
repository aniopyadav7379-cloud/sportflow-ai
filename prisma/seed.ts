import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SportFlow AI database...");

  // --- Admin user -----------------------------------------------------
  const adminEmail = "admin@sportflow.ai";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Anoop Yadav",
        email: adminEmail,
        passwordHash: await bcrypt.hash("Admin@12345", 10),
        role: "ADMIN",
      },
    });
    console.log(`Created admin user: ${adminEmail} / Admin@12345`);
  }

  // --- Clubs + Teams ----------------------------------------------------
  const clubsData = [
    { name: "Warriors Football Club", city: "Mumbai", country: "India", founded: 2018, logoColor: "#166534", description: "Professional football club competing in the Premier League." },
    { name: "Thunder United FC", city: "Pune", country: "India", founded: 2015, logoColor: "#1d4ed8", description: "Community-rooted club focused on homegrown youth talent." },
    { name: "Blasters Sports Club", city: "Kochi", country: "India", founded: 2011, logoColor: "#b91c1c", description: "One of the region's most decorated clubs." },
  ];

  const clubs = [];
  for (const c of clubsData) {
    const found = await prisma.club.findFirst({ where: { name: c.name } });
    const club = found ?? (await prisma.club.create({ data: c }));
    clubs.push(club);
  }

  const [warriors, thunder, blasters] = clubs;

  const existingTeams = await prisma.team.count();
  if (existingTeams === 0) {
    await prisma.team.createMany({
      data: [
        { name: "Warriors FC - Senior", category: "Senior Men", coach: "Rahul Sharma", matches: 18, winPct: 72, clubId: warriors.id },
        { name: "Warriors FC - U21", category: "Under 21", coach: "Arjun Mehta", matches: 16, winPct: 68, clubId: warriors.id },
        { name: "Thunder United - Senior", category: "Senior Men", coach: "Vikram Singh", matches: 14, winPct: 60, clubId: thunder.id },
      ],
    });
  }

  const teams = await prisma.team.findMany();

  // --- Players -----------------------------------------------------------
  if ((await prisma.player.count()) === 0) {
    await prisma.player.createMany({
      data: [
        { name: "Rahul Sharma", jersey: 10, position: "Midfielder (CM)", age: 24, height: "5'10\" (178 cm)", weight: "72 kg", foot: "Right", nationality: "India", overall: 8.2, fitness: 87, form: "Good", matches: 28, goals: 6, assists: 8, marketValue: "₹45.6L", clubId: warriors.id, teamId: teams[0]?.id },
        { name: "Arjun Mehta", jersey: 7, position: "Attacking Mid (CAM)", age: 23, height: "5'9\" (175 cm)", weight: "70 kg", foot: "Right", nationality: "India", overall: 7.9, fitness: 82, form: "Good", matches: 24, goals: 9, assists: 5, marketValue: "₹38.2L", clubId: warriors.id, teamId: teams[1]?.id },
        { name: "Vikram Singh", jersey: 5, position: "Center Back (CB)", age: 26, height: "6'1\" (185 cm)", weight: "80 kg", foot: "Right", nationality: "India", overall: 7.6, fitness: 90, form: "Excellent", matches: 30, goals: 2, assists: 1, marketValue: "₹29.4L", clubId: thunder.id, teamId: teams[2]?.id },
        { name: "Karan Patel", jersey: 9, position: "Striker (ST)", age: 22, height: "5'11\" (180 cm)", weight: "74 kg", foot: "Left", nationality: "India", overall: 7.8, fitness: 88, form: "Good", matches: 26, goals: 14, assists: 3, marketValue: "₹41.0L", clubId: blasters.id },
        { name: "Aditya Verma", jersey: 11, position: "Winger (RW)", age: 21, height: "5'8\" (173 cm)", weight: "68 kg", foot: "Right", nationality: "India", overall: 7.6, fitness: 85, form: "Average", matches: 20, goals: 7, assists: 6, marketValue: "₹22.8L", clubId: blasters.id },
      ],
    });
  }

  // --- Venues --------------------------------------------------------------
  if ((await prisma.venue.count()) === 0) {
    await prisma.venue.createMany({
      data: [
        { name: "Central Arena", location: "Mumbai, Maharashtra", type: "Stadium", capacity: 25000, surface: "Grass", utilization: 95, status: "Active", clubId: warriors.id },
        { name: "Green Field Arena", location: "Bengaluru, Karnataka", type: "Indoor", capacity: 8000, surface: "Synthetic", utilization: 88, status: "Active" },
        { name: "National Stadium", location: "Delhi, Delhi", type: "Stadium", capacity: 55000, surface: "Grass", utilization: 92, status: "Active" },
        { name: "Warriors Training Ground", location: "Mumbai, Maharashtra", type: "Training Ground", capacity: 200, surface: "Grass", utilization: 78, status: "Active", clubId: warriors.id },
        { name: "Elite Performance Center", location: "Pune, Maharashtra", type: "Indoor", capacity: 150, surface: "Synthetic", utilization: 85, status: "Maintenance" },
      ],
    });
  }

  // --- Leagues + Matches -----------------------------------------------------
  if ((await prisma.league.count()) === 0) {
    await prisma.league.createMany({
      data: [
        { name: "Premier League 2024-25", sport: "Football", matchday: "32 / 38", status: "Live", progress: 84 },
        { name: "Indian Super League", sport: "Football", matchday: "20 / 26", status: "Live", progress: 77 },
      ],
    });
  }
  const [league1] = await prisma.league.findMany();
  const [venue1] = await prisma.venue.findMany();

  if ((await prisma.match.count()) === 0) {
    const now = new Date();
    await prisma.match.createMany({
      data: [
        { homeTeam: "Warriors FC", awayTeam: "Titans FC", date: now, venueId: venue1?.id, leagueId: league1?.id, status: "Live", homeScore: 2, awayScore: 1 },
        { homeTeam: "Blasters United", awayTeam: "Rovers Club", date: new Date(now.getTime() + 86400000), leagueId: league1?.id, status: "Upcoming" },
        { homeTeam: "City FC", awayTeam: "United FC", date: new Date(now.getTime() + 2 * 86400000), leagueId: league1?.id, status: "Upcoming" },
        { homeTeam: "Rovers Club", awayTeam: "Kings FC", date: new Date(now.getTime() - 86400000), leagueId: league1?.id, status: "Completed", homeScore: 3, awayScore: 2 },
      ],
    });
  }

  // --- Scouting --------------------------------------------------------------
  if ((await prisma.scoutedPlayer.count()) === 0) {
    await prisma.scoutedPlayer.createMany({
      data: [
        { name: "Arjun Mehta Jr.", position: "CAM", age: 18, country: "India", team: "FC Goa U19", overall: 82, potential: "High", stage: "Shortlisted", strengths: JSON.stringify(["Vision", "Passing", "Ball Control"]) },
        { name: "Daniel Okafor", position: "ST", age: 19, country: "Ghana", team: "Right To Dream Academy", overall: 78, potential: "High", stage: "Prospect", strengths: JSON.stringify(["Finishing", "Pace"]) },
        { name: "Lucas Pereira", position: "LW", age: 19, country: "Brazil", team: "Palmeiras U20", overall: 76, potential: "Medium", stage: "OnTrial", strengths: JSON.stringify(["Dribbling"]) },
      ],
    });
  }

  // --- Sponsors, Tickets, Staff ------------------------------------------------
  if ((await prisma.sponsor.count()) === 0) {
    await prisma.sponsor.createMany({
      data: [
        { company: "Nova Sportswear", package: "Title Sponsor", startDate: new Date("2024-01-01"), endDate: new Date("2026-12-31"), value: 1200000, status: "Active", clubId: warriors.id },
        { company: "PeakFuel Nutrition", package: "Official Partner", startDate: new Date("2024-03-01"), endDate: new Date("2025-03-01"), value: 680000, status: "Active" },
      ],
    });
  }

  if ((await prisma.ticket.count()) === 0) {
    await prisma.ticket.createMany({
      data: [
        { type: "General", price: 499, quantity: 1000, sold: 820 },
        { type: "VIP", price: 1999, quantity: 300, sold: 240 },
        { type: "Season Pass", price: 8999, quantity: 200, sold: 188 },
      ],
    });
  }

  if ((await prisma.staffMember.count()) === 0) {
    await prisma.staffMember.createMany({
      data: [
        { name: "Dr. Priya Nair", department: "Medical", role: "Head Physiotherapist", status: "Available" },
        { name: "Manoj Yadav", department: "Equipment", role: "Kit Manager", status: "Available" },
        { name: "Sahil Verma", department: "Security", role: "Venue Security Lead", status: "On Duty" },
      ],
    });
  }

  const players = await prisma.player.findMany();

  // --- Standings + player match stats ---------------------------------------
  if ((await prisma.standingsRow.count()) === 0 && league1) {
    await prisma.standingsRow.createMany({
      data: [
        { leagueId: league1.id, team: "Warriors FC", played: 31, won: 22, drawn: 5, lost: 4, goalsFor: 75, goalsAgainst: 28, points: 71, form: JSON.stringify(["W", "W", "D", "W", "W"]) },
        { leagueId: league1.id, team: "Thunder United", played: 31, won: 20, drawn: 6, lost: 5, goalsFor: 68, goalsAgainst: 26, points: 66, form: JSON.stringify(["W", "D", "W", "W", "W"]) },
        { leagueId: league1.id, team: "Blasters Sports Club", played: 31, won: 17, drawn: 5, lost: 9, goalsFor: 59, goalsAgainst: 40, points: 56, form: JSON.stringify(["W", "L", "W", "W", "D"]) },
      ],
    });
  }

  if ((await prisma.playerMatchStat.count()) === 0 && players.length > 0 && league1) {
    const rahul = players.find((p) => p.name === "Rahul Sharma");
    const [firstMatch] = await prisma.match.findMany({ where: { leagueId: league1.id }, take: 1 });
    if (rahul) {
      await prisma.playerMatchStat.createMany({
        data: [
          { playerId: rahul.id, matchId: firstMatch?.id, opponent: "Thunder United", date: new Date("2024-06-12"), scoreLine: "2 - 1", rating: 8.6, goals: 1, assists: 1, minutes: 90 },
          { playerId: rahul.id, opponent: "Sky Kings", date: new Date("2024-06-05"), scoreLine: "1 - 1", rating: 7.9, goals: 0, assists: 0, minutes: 90 },
          { playerId: rahul.id, opponent: "Blasters United", date: new Date("2024-05-29"), scoreLine: "0 - 2", rating: 8.3, goals: 0, assists: 1, minutes: 90 },
          { playerId: rahul.id, opponent: "Titans FC", date: new Date("2024-05-22"), scoreLine: "3 - 0", rating: 7.5, goals: 0, assists: 0, minutes: 90 },
          { playerId: rahul.id, opponent: "Rovers Club", date: new Date("2024-05-15"), scoreLine: "2 - 2", rating: 8.1, goals: 1, assists: 0, minutes: 90 },
        ],
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());