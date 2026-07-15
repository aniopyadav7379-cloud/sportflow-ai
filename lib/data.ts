// Centralized mock data for the SportFlow AI demo.
// Replace with real API/service calls (see /services) when wiring a backend.

export const performanceTrend = [
  { date: "1 Jul", matches: 12, wins: 8, goals: 20 },
  { date: "7 Jul", matches: 18, wins: 11, goals: 28 },
  { date: "14 Jul", matches: 24, wins: 15, goals: 36 },
  { date: "21 Jul", matches: 30, wins: 20, goals: 44 },
  { date: "28 Jul", matches: 36, wins: 24, goals: 50 },
];

export const ticketSales = [
  { date: "1 Jul", value: 60 }, { date: "5 Jul", value: 90 }, { date: "10 Jul", value: 75 },
  { date: "15 Jul", value: 110 }, { date: "20 Jul", value: 95 }, { date: "25 Jul", value: 140 },
  { date: "30 Jul", value: 120 },
];

export const sponsorshipTrend = [
  { date: "1 Jul", value: 1.2 }, { date: "10 Jul", value: 1.8 }, { date: "20 Jul", value: 1.5 },
  { date: "30 Jul", value: 2.45 },
];

export const upcomingMatches = [
  { id: "m1", date: "JUL 15", home: "Warriors FC", away: "Thunder United", league: "Premier League", time: "7:00 PM", venue: "City Stadium" },
  { id: "m2", date: "JUL 16", home: "Sky Kings", away: "Rovers Club", league: "Super League", time: "5:30 PM", venue: "Green Field Arena" },
  { id: "m3", date: "JUL 18", home: "Titans FC", away: "Blasters United", league: "Premier League", time: "8:00 PM", venue: "National Stadium" },
];

export const topPlayers = [
  { rank: 1, name: "Rahul Sharma", club: "Warriors FC", rating: 8.5 },
  { rank: 2, name: "Arjun Mehta", club: "Thunder United", rating: 8.2 },
  { rank: 3, name: "Vikram Singh", club: "Rovers Club", rating: 7.9 },
  { rank: 4, name: "Karan Patel", club: "Sky Kings", rating: 7.8 },
  { rank: 5, name: "Aditya Verma", club: "Blasters United", rating: 7.6 },
];

export type Club = {
  id: string;
  name: string;
  city: string;
  country: string;
  founded: number;
  status: "Active" | "Inactive";
  teams: number;
  players: number;
  logoColor: string;
  description: string;
};

export const clubs: Club[] = [
  { id: "wfc", name: "Warriors Football Club", city: "Mumbai, Maharashtra", country: "India", founded: 2018, status: "Active", teams: 8, players: 126, logoColor: "#166534", description: "Professional football club competing in the Premier League. Our mission is to develop talent and bring glory to our fans." },
  { id: "tuf", name: "Thunder United FC", city: "Pune, Maharashtra", country: "India", founded: 2015, status: "Active", teams: 5, players: 78, logoColor: "#1d4ed8", description: "A community-rooted club focused on developing homegrown youth talent into first-team regulars." },
  { id: "bsc", name: "Blasters Sports Club", city: "Kochi, Kerala", country: "India", founded: 2011, status: "Active", teams: 4, players: 62, logoColor: "#b91c1c", description: "One of the region's most decorated clubs, known for an attacking style of play." },
  { id: "rac", name: "Rovers Athletic Club", city: "Bengaluru, Karnataka", country: "India", founded: 2019, status: "Active", teams: 3, players: 45, logoColor: "#0f766e", description: "A fast-growing club with strong academy pipelines across age groups." },
  { id: "skf", name: "Sky Kings FC", city: "Chennai, Tamil Nadu", country: "India", founded: 2013, status: "Inactive", teams: 2, players: 32, logoColor: "#2563eb", description: "Currently on a competitive hiatus while the club restructures its youth setup." },
  { id: "tsa", name: "Titans Sports Academy", city: "Hyderabad, Telangana", country: "India", founded: 2020, status: "Active", teams: 2, players: 28, logoColor: "#b45309", description: "An academy-first club focused entirely on player development pathways." },
  { id: "ebc", name: "Elite Basketball Club", city: "Delhi, Delhi", country: "India", founded: 2016, status: "Active", teams: 1, players: 12, logoColor: "#7c3aed", description: "A multi-sport organization's flagship basketball program." },
  { id: "cuf", name: "City United FC", city: "Ahmedabad, Gujarat", country: "India", founded: 2012, status: "Inactive", teams: 1, players: 10, logoColor: "#475569", description: "A grassroots club currently rebuilding after a season away from competition." },
];

export const teamsByClub: Record<string, {
  name: string; category: string; coach: string; players: number; matches: number; winPct: number; status: "Active" | "Inactive";
}[]> = {
  wfc: [
    { name: "Warriors FC - Senior", category: "Senior Men", coach: "Rahul Sharma", players: 28, matches: 18, winPct: 72, status: "Active" },
    { name: "Warriors FC - U21", category: "Under 21", coach: "Arjun Mehta", players: 24, matches: 16, winPct: 68, status: "Active" },
    { name: "Warriors FC - U18", category: "Under 18", coach: "Vikram Singh", players: 22, matches: 14, winPct: 64, status: "Active" },
    { name: "Warriors FC - U16", category: "Under 16", coach: "Karan Patel", players: 20, matches: 12, winPct: 60, status: "Active" },
    { name: "Warriors FC - U14", category: "Under 14", coach: "Sahil Verma", players: 18, matches: 10, winPct: 58, status: "Active" },
    { name: "Warriors FC - U12", category: "Under 12", coach: "Nikhil Rao", players: 16, matches: 8, winPct: 56, status: "Active" },
    { name: "Warriors FC - Women", category: "Women Team", coach: "Priya Nair", players: 22, matches: 12, winPct: 70, status: "Active" },
    { name: "Warriors FC - Academy", category: "Development", coach: "Manoj Yadav", players: 12, matches: 6, winPct: 50, status: "Active" },
  ],
};

export type Player = {
  id: string;
  name: string;
  jersey: number;
  position: string;
  club: string;
  team: string;
  age: number;
  height: string;
  weight: string;
  foot: "Left" | "Right";
  nationality: string;
  overall: number;
  fitness: number;
  form: "Excellent" | "Good" | "Average";
  matches: number;
  goals: number;
  assists: number;
  marketValue: string;
  photo: string;
};

export const players: Player[] = [
  { id: "p1", name: "Rahul Sharma", jersey: 10, position: "Midfielder (CM)", club: "Warriors FC", team: "Senior", age: 24, height: "5'10\" (178 cm)", weight: "72 kg", foot: "Right", nationality: "India", overall: 8.2, fitness: 87, form: "Good", matches: 28, goals: 6, assists: 8, marketValue: "₹45.6L", photo: "https://randomuser.me/api/portraits/men/45.jpg" },
  { id: "p2", name: "Arjun Mehta", jersey: 7, position: "Attacking Mid (CAM)", club: "Thunder United", team: "Senior", age: 23, height: "5'9\" (175 cm)", weight: "70 kg", foot: "Right", nationality: "India", overall: 7.9, fitness: 82, form: "Good", matches: 24, goals: 9, assists: 5, marketValue: "₹38.2L", photo: "https://randomuser.me/api/portraits/men/22.jpg" },
  { id: "p3", name: "Vikram Singh", jersey: 5, position: "Center Back (CB)", club: "Rovers Club", team: "Senior", age: 26, height: "6'1\" (185 cm)", weight: "80 kg", foot: "Right", nationality: "India", overall: 7.6, fitness: 90, form: "Excellent", matches: 30, goals: 2, assists: 1, marketValue: "₹29.4L", photo: "https://randomuser.me/api/portraits/men/54.jpg" },
  { id: "p4", name: "Karan Patel", jersey: 9, position: "Striker (ST)", club: "Sky Kings", team: "Senior", age: 22, height: "5'11\" (180 cm)", weight: "74 kg", foot: "Left", nationality: "India", overall: 7.8, fitness: 88, form: "Good", matches: 26, goals: 14, assists: 3, marketValue: "₹41.0L", photo: "https://randomuser.me/api/portraits/men/61.jpg" },
  { id: "p5", name: "Aditya Verma", jersey: 11, position: "Winger (RW)", club: "Blasters United", team: "Senior", age: 21, height: "5'8\" (173 cm)", weight: "68 kg", foot: "Right", nationality: "India", overall: 7.6, fitness: 85, form: "Average", matches: 20, goals: 7, assists: 6, marketValue: "₹22.8L", photo: "https://randomuser.me/api/portraits/men/18.jpg" },
];

export const performanceHistory = [
  { date: "10 Apr", rating: 6.5 }, { date: "17 Apr", rating: 7.2 }, { date: "24 Apr", rating: 7.8 },
  { date: "1 May", rating: 6.9 }, { date: "8 May", rating: 7.6 }, { date: "15 May", rating: 8.1 },
  { date: "22 May", rating: 7.5 }, { date: "29 May", rating: 8.3 }, { date: "5 Jun", rating: 7.9 },
  { date: "12 Jun", rating: 8.6 },
];

export const recentMatchesForPlayer = [
  { date: "12 Jun 2024", match: "Warriors FC vs Thunder United", score: "2 - 1", rating: 8.6, stats: "1 Goal, 1 Assist" },
  { date: "5 Jun 2024", match: "Warriors FC vs Sky Kings", score: "1 - 1", rating: 7.9, stats: "90 Min" },
  { date: "29 May 2024", match: "Blasters United vs Warriors FC", score: "0 - 2", rating: 8.3, stats: "1 Assist" },
  { date: "22 May 2024", match: "Warriors FC vs Titans FC", score: "3 - 0", rating: 7.5, stats: "90 Min" },
  { date: "15 May 2024", match: "Rovers Club vs Warriors FC", score: "2 - 2", rating: 8.1, stats: "1 Goal" },
];

export const leagues = [
  { id: "epl", name: "Premier League 2024-25", sport: "Football • Professional", matchday: "32 / 38", status: "Live", progress: 84 },
  { id: "laliga", name: "La Liga 2024-25", sport: "Football • Professional", matchday: "36 / 38", status: "Live", progress: 94 },
  { id: "ucl", name: "UEFA Champions League", sport: "Football • International", matchday: "Semi Finals", status: "Live", progress: 88 },
  { id: "isl", name: "Indian Super League", sport: "Football • Professional", matchday: "20 / 26", status: "Live", progress: 77 },
  { id: "pkl", name: "Pro Kabaddi League 11", sport: "Kabaddi • Professional", matchday: "45 / 132", status: "In Progress", progress: 34 },
];

export const leagueStandings = [
  { pos: 1, team: "Manchester City", p: 31, w: 22, d: 5, l: 4, gf: 75, ga: 28, gd: "+47", pts: 71, form: ["W","W","D","W","W"] },
  { pos: 2, team: "Arsenal FC", p: 31, w: 20, d: 6, l: 5, gf: 68, ga: 26, gd: "+42", pts: 66, form: ["W","D","W","W","W"] },
  { pos: 3, team: "Liverpool FC", p: 31, w: 19, d: 8, l: 4, gf: 70, ga: 32, gd: "+38", pts: 65, form: ["W","W","D","W","W"] },
  { pos: 4, team: "Aston Villa", p: 32, w: 18, d: 6, l: 8, gf: 52, ga: 35, gd: "+17", pts: 60, form: ["W","W","L","W","D"] },
  { pos: 5, team: "Tottenham Hotspur", p: 31, w: 17, d: 5, l: 9, gf: 59, ga: 40, gd: "+19", pts: 56, form: ["W","L","W","W","D"] },
];

export const topScorers = [
  { rank: 1, name: "Erling Haaland", club: "Manchester City", goals: 25 },
  { rank: 2, name: "Kylian Mbappé", club: "Real Madrid", goals: 22 },
  { rank: 3, name: "Harry Kane", club: "Bayern Munich", goals: 20 },
  { rank: 4, name: "Viktor Gyökeres", club: "Sporting CP", goals: 18 },
  { rank: 5, name: "Sunil Chhetri", club: "Bengaluru FC", goals: 15 },
];

export const fixturesWide = [
  { date: "MAY 18", home: "Manchester City", away: "Arsenal FC", league: "Premier League", time: "8:00 PM", venue: "Etihad Stadium" },
  { date: "MAY 18", home: "Real Madrid", away: "Barcelona", league: "La Liga", time: "10:15 PM", venue: "Santiago Bernabéu" },
  { date: "MAY 19", home: "Bayern Munich", away: "Real Madrid", league: "UCL", time: "12:30 AM", venue: "Allianz Arena" },
  { date: "MAY 19", home: "Mohun Bagan SG", away: "Mumbai City FC", league: "ISL", time: "7:30 PM", venue: "Salt Lake Stadium" },
];

export const scheduleEvents = [
  { day: "Mon 13 May", allDay: "League Match", items: [
    { title: "Training Session", team: "Warriors FC - Senior", time: "7:00 AM - 9:00 AM", venue: "Central Arena", type: "training" },
    { title: "Match Day", team: "Warriors FC vs Titans", time: "4:00 PM - 6:00 PM", venue: "City Stadium", type: "match" },
    { title: "Strength Training", team: "Warriors FC - Senior", time: "7:00 PM - 8:30 PM", venue: "FitZone Gym", type: "training" },
  ]},
  { day: "Tue 14 May", allDay: "Team Building Camp", items: [
    { title: "Gym Session", team: "Warriors FC - U21", time: "7:30 AM - 8:30 AM", venue: "FitZone Gym", type: "training" },
    { title: "Video Analysis", team: "Warriors FC - Senior", time: "12:00 PM - 1:30 PM", venue: "Meeting Room 1", type: "analysis" },
    { title: "Friendly Match", team: "U21 vs United FC", time: "4:00 PM - 6:00 PM", venue: "Green Field Arena", type: "match" },
  ]},
  { day: "Wed 15 May", allDay: "", items: [
    { title: "Training Session", team: "Warriors FC - Senior", time: "7:00 AM - 9:00 AM", venue: "Central Arena", type: "training" },
    { title: "Training Session", team: "Warriors FC - U18", time: "12:00 PM - 2:00 PM", venue: "Ground B", type: "training" },
    { title: "Yoga & Mobility", team: "Warriors FC - Senior", time: "7:00 PM - 8:00 PM", venue: "Wellness Center", type: "other" },
  ]},
  { day: "Thu 16 May", allDay: "League Match", items: [
    { title: "Recovery Session", team: "Warriors FC - Senior", time: "7:30 AM - 8:30 AM", venue: "Wellness Center", type: "training" },
    { title: "Match Day", team: "Warriors FC vs Kings", time: "4:00 PM - 6:00 PM", venue: "National Stadium", type: "match" },
  ]},
  { day: "Fri 17 May", allDay: "", items: [
    { title: "Training Session", team: "Warriors FC - U21", time: "7:00 AM - 9:00 AM", venue: "Central Arena", type: "training" },
    { title: "Video Analysis", team: "Warriors FC - U21", time: "12:00 PM - 1:30 PM", venue: "Meeting Room 2", type: "analysis" },
    { title: "Team Meeting", team: "Warriors FC - Senior", time: "7:00 PM - 8:00 PM", venue: "Meeting Room 1", type: "other" },
  ]},
  { day: "Sat 18 May", allDay: "Youth Tournament", items: [
    { title: "Tactical Session", team: "Warriors FC - U18", time: "7:30 AM - 9:00 AM", venue: "Training Ground", type: "training" },
    { title: "Goalkeeper Training", team: "Warriors FC - Senior", time: "4:00 PM - 5:30 PM", venue: "Training Ground", type: "training" },
  ]},
  { day: "Sun 19 May", allDay: "", items: [] },
];

export const scheduleConflicts = [
  { title: "U21 Training overlaps with Gym Session", date: "14 May 2024 • 7:30 AM", severity: "High" },
  { title: "Ground B double booking", date: "15 May 2024 • 12:00 PM", severity: "Medium" },
  { title: "Coach unavailable for session", date: "17 May 2024 • 4:00 PM", severity: "Low" },
];

export const matches = [
  { id: "mt1", date: "MAY 18", day: "Sat, 8:00 PM", home: "Warriors FC", away: "Titans FC", league: "Premier League 2024-25", venue: "Central Arena, Mumbai", status: "Live", score: "2 - 1", time: "78'" },
  { id: "mt2", date: "MAY 18", day: "Sat, 6:00 PM", home: "Blasters United", away: "Rovers Club", league: "La Liga 2024-25", venue: "Green Field Arena, Bengaluru", status: "Live", score: "1 - 0", time: "45'" },
  { id: "mt3", date: "MAY 19", day: "Sun, 7:30 PM", home: "City FC", away: "United FC", league: "Premier League 2024-25", venue: "City Stadium, Delhi", status: "Upcoming", score: "-", time: "In 2h 15m" },
  { id: "mt4", date: "MAY 19", day: "Sun, 5:30 PM", home: "Kings FC", away: "Thunder United", league: "La Liga 2024-25", venue: "National Stadium, Kolkata", status: "Upcoming", score: "-", time: "In 4h 15m" },
  { id: "mt5", date: "MAY 20", day: "Mon, 8:00 PM", home: "Warriors FC", away: "Blasters United", league: "Indian Super League 2023-24", venue: "Central Arena, Mumbai", status: "Upcoming", score: "-", time: "In 1 day" },
  { id: "mt6", date: "MAY 20", day: "Mon, 6:30 PM", home: "Titans FC", away: "City FC", league: "Premier League 2024-25", venue: "Green Field Arena, Bengaluru", status: "Upcoming", score: "-", time: "In 1 day" },
  { id: "mt7", date: "MAY 17", day: "Fri, 7:00 PM", home: "Rovers Club", away: "Kings FC", league: "La Liga 2024-25", venue: "Rovers Arena, Chennai", status: "Completed", score: "3 - 2", time: "Full Time" },
  { id: "mt8", date: "MAY 16", day: "Thu, 8:30 PM", home: "United FC", away: "Thunder United", league: "Premier League 2024-25", venue: "United Stadium, Hyderabad", status: "Completed", score: "0 - 0", time: "Full Time" },
];

export const liveMatchStats = { possession: [58, 42], shots: [12, 6], shotsOnTarget: [6, 3], corners: [5, 2], fouls: [8, 10], yellow: [1, 2], red: [0, 0] };

export const recentResults = [
  { score: "2-1", result: "W" }, { score: "0-0", result: "D" }, { score: "3-2", result: "W" },
  { score: "1-2", result: "L" }, { score: "4-0", result: "W" },
];

export type Venue = {
  id: string;
  name: string;
  location: string;
  type: "Stadium" | "Indoor" | "Training Ground";
  capacity: number;
  surface: string;
  utilization: number;
  status: "Active" | "Maintenance";
  image: string;
};

export const venues: Venue[] = [
  { id: "v1", name: "Central Arena", location: "Mumbai, Maharashtra", type: "Stadium", capacity: 25000, surface: "Grass", utilization: 95, status: "Active", image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=240&fit=crop" },
  { id: "v2", name: "Green Field Arena", location: "Bengaluru, Karnataka", type: "Indoor", capacity: 8000, surface: "Synthetic", utilization: 88, status: "Active", image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=240&fit=crop" },
  { id: "v3", name: "National Stadium", location: "Delhi, Delhi", type: "Stadium", capacity: 55000, surface: "Grass", utilization: 92, status: "Active", image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=240&fit=crop" },
  { id: "v4", name: "Warriors Training Ground", location: "Mumbai, Maharashtra", type: "Training Ground", capacity: 200, surface: "Grass", utilization: 78, status: "Active", image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=240&fit=crop" },
  { id: "v5", name: "Elite Performance Center", location: "Pune, Maharashtra", type: "Indoor", capacity: 150, surface: "Synthetic", utilization: 85, status: "Maintenance", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=240&fit=crop" },
  { id: "v6", name: "City Sports Complex", location: "Hyderabad, Telangana", type: "Training Ground", capacity: 500, surface: "Mixed", utilization: 65, status: "Active", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=240&fit=crop" },
];

export const venueBookings = [
  { date: "MAY 18", title: "Premier League Match", venue: "Central Arena", time: "7:00 PM - 10:00 PM", status: "Confirmed" },
  { date: "MAY 19", title: "Training Session", venue: "Green Field Arena", time: "6:00 AM - 8:00 AM", status: "Confirmed" },
  { date: "MAY 20", title: "Youth Tournament", venue: "City Sports Complex", time: "9:00 AM - 5:00 PM", status: "Pending" },
  { date: "MAY 21", title: "Corporate Event", venue: "Elite Performance Center", time: "2:00 PM - 6:00 PM", status: "Confirmed" },
];

export const venueMaintenance = [
  { name: "Elite Performance Center", location: "Pune, Maharashtra", range: "May 18 - May 22" },
  { name: "City Sports Complex", location: "Hyderabad, Telangana", range: "May 25 - May 27" },
];

export type ScoutedPlayer = {
  id: string;
  name: string;
  position: string;
  age: number;
  country: string;
  team: string;
  overall: number;
  potential: "High" | "Medium" | "Low";
  addedOn: string;
  photo: string;
  scoutRating: number;
  strengths: string[];
};

export const scoutedPlayers: ScoutedPlayer[] = [
  { id: "s1", name: "Arjun Mehta", position: "CAM", age: 18, country: "India", team: "FC Goa U19", overall: 82, potential: "High", addedOn: "18 May 2024", photo: "https://randomuser.me/api/portraits/men/76.jpg", scoutRating: 82, strengths: ["Vision", "Passing", "Ball Control", "Work Rate", "Composure"] },
  { id: "s2", name: "Daniel Okafor", position: "ST", age: 19, country: "Ghana", team: "Right To Dream Academy", overall: 78, potential: "High", addedOn: "17 May 2024", photo: "https://randomuser.me/api/portraits/men/83.jpg", scoutRating: 78, strengths: ["Finishing", "Pace", "Aerial Duels"] },
  { id: "s3", name: "Lucas Pereira", position: "LW", age: 19, country: "Brazil", team: "Palmeiras U20", overall: 76, potential: "Medium", addedOn: "16 May 2024", photo: "https://randomuser.me/api/portraits/men/12.jpg", scoutRating: 76, strengths: ["Dribbling", "Acceleration"] },
  { id: "s4", name: "Ethan Walker", position: "CB", age: 17, country: "Australia", team: "Melbourne City FC Youth", overall: 74, potential: "High", addedOn: "15 May 2024", photo: "https://randomuser.me/api/portraits/men/29.jpg", scoutRating: 74, strengths: ["Aerial Duels", "Positioning"] },
  { id: "s5", name: "Mohammed Al-Harbi", position: "CM", age: 18, country: "Saudi Arabia", team: "Al Hilal U19", overall: 72, potential: "Medium", addedOn: "14 May 2024", photo: "https://randomuser.me/api/portraits/men/64.jpg", scoutRating: 72, strengths: ["Passing", "Stamina"] },
  { id: "s6", name: "Javier Sánchez", position: "RW", age: 19, country: "Colombia", team: "Atletico Nacional U20", overall: 70, potential: "Medium", addedOn: "13 May 2024", photo: "https://randomuser.me/api/portraits/men/41.jpg", scoutRating: 70, strengths: ["Pace", "Crossing"] },
  { id: "s7", name: "Tariq Ahmed", position: "GK", age: 17, country: "India", team: "Bengaluru FC U18", overall: 68, potential: "Low", addedOn: "12 May 2024", photo: "https://randomuser.me/api/portraits/men/8.jpg", scoutRating: 68, strengths: ["Reflexes", "Distribution"] },
  { id: "s8", name: "Kwame Mensah", position: "CDM", age: 17, country: "Ghana", team: "Liberty Professionals", overall: 66, potential: "Low", addedOn: "11 May 2024", photo: "https://randomuser.me/api/portraits/men/50.jpg", scoutRating: 66, strengths: ["Tackling", "Discipline"] },
];

export const scoutAttributes = { pace: 70, shooting: 75, passing: 83, dribbling: 80, defending: 60, physical: 68 };
