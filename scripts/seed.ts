/**
 * Seed the Turso database with sample data:
 *   - 1 admin user
 *   - 3 agent users
 *   - 2 buyer users
 *   - 20+ properties across major UK cities (mix of sale + rent)
 *   - Sample images for each property
 *   - A few favourites, messages, and reviews for demo purposes
 *
 * Run with:  bun run scripts/seed.ts
 *
 * Passwords for all demo accounts: "password123"
 */
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";
import { buildPropertySlug } from "../src/lib/format";

const DEMO_PASSWORD = "password123";

// UK city coordinates (approximate centres) for the map
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  London: { lat: 51.5074, lng: -0.1278 },
  Manchester: { lat: 53.4808, lng: -2.2426 },
  Birmingham: { lat: 52.4862, lng: -1.8904 },
  Leeds: { lat: 53.8008, lng: -1.5491 },
  Bristol: { lat: 51.4545, lng: -2.5879 },
  Liverpool: { lat: 53.4084, lng: -2.9916 },
  Edinburgh: { lat: 55.9533, lng: -3.1883 },
  Glasgow: { lat: 55.8642, lng: -4.2518 },
  Cardiff: { lat: 51.4816, lng: -3.1791 },
  Sheffield: { lat: 53.3811, lng: -1.4701 },
  Newcastle: { lat: 54.9783, lng: -1.6178 },
  Cambridge: { lat: 52.2053, lng: 0.1218 },
  Oxford: { lat: 51.7520, lng: -1.2577 },
  Brighton: { lat: 50.8225, lng: -0.1372 },
  Nottingham: { lat: 52.9548, lng: -1.1581 },
};

// Sample Unsplash image URLs (residential properties)
const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
  "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1200",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
  "https://images.unsplash.com/photo-1600573472556-e636c2acda88?w=1200",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200",
];

interface SeedProperty {
  title: string;
  description: string;
  price: number;
  listingType: "sale" | "rent";
  propertyType: "house" | "flat" | "bungalow" | "maisonette" | "cottage" | "land" | "other";
  bedrooms: number;
  bathrooms: number;
  receptionRooms: number;
  address: string;
  postcode: string;
  city: string;
  epcRating: string;
  features: string[];
  status: "active" | "sold" | "let" | "draft";
  isNewBuild: boolean;
  hasGarden: boolean;
  hasParking: boolean;
}

const PROPERTIES: SeedProperty[] = [
  // London — sale
  {
    title: "Stylish 2-bed apartment in Canary Wharf",
    description: "A modern two-bedroom apartment on the 18th floor of a sought-after Canary Wharf development. Floor-to-ceiling windows offer stunning views across the Thames. Open-plan kitchen with integrated appliances, master bedroom with en-suite, secure underground parking, and 24-hour concierge. Moments from Canary Wharf tube and the Elizabeth Line.",
    price: 525000, listingType: "sale", propertyType: "flat",
    bedrooms: 2, bathrooms: 2, receptionRooms: 1,
    address: "18 Harbour Exchange Square", postcode: "E14 9GE", city: "London",
    epcRating: "B",
    features: ["Balcony", "Central heating", "Double glazing", "En-suite", "Fitted kitchen", "Parking", "Concierge"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: true,
  },
  {
    title: "Victorian terrace in leafy Clapham",
    description: "Beautifully restored three-bedroom Victorian terrace in the heart of Clapham Old Town. Original features including fireplaces, cornicing, and sash windows sit alongside a sleek extended kitchen with bi-fold doors onto a south-facing garden. Two reception rooms, family bathroom, and a stylish master suite. Clapham Common is a 5-minute walk.",
    price: 925000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 2, receptionRooms: 2,
    address: "42 Narbonne Avenue", postcode: "SW4 9JU", city: "London",
    epcRating: "D",
    features: ["Fireplace", "Garden", "Central heating", "Double glazing", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: true, hasParking: false,
  },
  {
    title: "Modern 1-bed flat near London Bridge",
    description: "Compact but perfectly formed one-bedroom flat in a contemporary development moments from London Bridge station. Open-plan living, modern bathroom, and a generous double bedroom. Ideal first-time buy or investment purchase. Leasehold, 125 years remaining, low service charge.",
    price: 385000, listingType: "sale", propertyType: "flat",
    bedrooms: 1, bathrooms: 1, receptionRooms: 1,
    address: "5 Bermondsey Street", postcode: "SE1 3UN", city: "London",
    epcRating: "B",
    features: ["Central heating", "Double glazing", "Fitted kitchen"],
    status: "active", isNewBuild: true, hasGarden: false, hasParking: false,
  },
  // London — rent
  {
    title: "Furnished 2-bed flat in Shoreditch",
    description: "Bright and contemporary two-bedroom furnished flat in the heart of Shoreditch. Exposed brickwork, wooden floors, and a fully fitted kitchen. Walking distance to Liverpool Street, Old Street, and the vibrant bars and restaurants of Brick Lane. Available immediately on an Assured Shorthold Tenancy.",
    price: 2400, listingType: "rent", propertyType: "flat",
    bedrooms: 2, bathrooms: 1, receptionRooms: 1,
    address: "12 Rivington Street", postcode: "EC2A 3DT", city: "London",
    epcRating: "C",
    features: ["Furnished", "Central heating", "Double glazing", "Fitted kitchen", "White goods included"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: false,
  },

  // Manchester
  {
    title: "Spacious 3-bed semi in Didsbury",
    description: "Well-presented three-bedroom semi-detached house in the ever-popular Didsbury area. Two reception rooms, fitted kitchen with dining area, family bathroom, and a generous rear garden. Driveway parking for two cars. Excellent local schools, parks, and the bars and cafés of Didsbury Village all within easy reach.",
    price: 365000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 1, receptionRooms: 2,
    address: "8 Barlow Moor Road", postcode: "M20 6TR", city: "Manchester",
    epcRating: "C",
    features: ["Garden", "Parking", "Central heating", "Double glazing", "Fitted kitchen", "Garage"],
    status: "active", isNewBuild: false, hasGarden: true, hasParking: true,
  },
  {
    title: "City centre 1-bed apartment with parking",
    description: "Modern one-bedroom apartment in the prestigious Crown Street development, Manchester city centre. Open-plan kitchen/living area with Juliet balcony, double bedroom with built-in wardrobes, and contemporary bathroom. Residents' gym, secure entry, and allocated parking included.",
    price: 185000, listingType: "sale", propertyType: "flat",
    bedrooms: 1, bathrooms: 1, receptionRooms: 1,
    address: "21 Crown Street", postcode: "M15 4QA", city: "Manchester",
    epcRating: "B",
    features: ["Parking", "Central heating", "Double glazing", "Fitted kitchen", "Gym"],
    status: "active", isNewBuild: true, hasGarden: false, hasParking: true,
  },
  {
    title: "Stylish 2-bed rental in Northern Quarter",
    description: "Chic two-bedroom apartment in Manchester's trendy Northern Quarter. Exposed brickwork, industrial-style kitchen, and original wooden floors. Master bedroom with en-suite shower room. Walk to Piccadilly station in 5 minutes. Available unfurnished.",
    price: 1450, listingType: "rent", propertyType: "flat",
    bedrooms: 2, bathrooms: 2, receptionRooms: 1,
    address: "3 Tib Street", postcode: "M4 1LX", city: "Manchester",
    epcRating: "C",
    features: ["En-suite", "Central heating", "Double glazing", "Fitted kitchen", "Walk-in wardrobe"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: false,
  },

  // Birmingham
  {
    title: "Luxury 2-bed apartment in Mailbox",
    description: "Stylish two-bedroom apartment in Birmingham's iconic Mailbox development. Floor-to-ceiling windows with city views, designer kitchen, two double bedrooms (master with en-suite), and secure parking. Residents' spa, gym, and 24-hour concierge. Walk to New Street station in 5 minutes.",
    price: 295000, listingType: "sale", propertyType: "flat",
    bedrooms: 2, bathrooms: 2, receptionRooms: 1,
    address: "127 Wharfside Street", postcode: "B1 1RJ", city: "Birmingham",
    epcRating: "B",
    features: ["Parking", "Central heating", "Double glazing", "En-suite", "Fitted kitchen", "Concierge"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: true,
  },
  {
    title: "Family home in Solihull with large garden",
    description: "Substantial four-bedroom detached family home in the desirable Solihull area. Three reception rooms, fitted breakfast kitchen, utility, two en-suites plus family bathroom, double garage, and approximately 100ft rear garden. Excellent catchment for local schools. Viewing highly recommended.",
    price: 675000, listingType: "sale", propertyType: "house",
    bedrooms: 4, bathrooms: 3, receptionRooms: 3,
    address: "15 Widney Manor Road", postcode: "B93 9LW", city: "Birmingham",
    epcRating: "C",
    features: ["Garden", "Garage", "Parking", "Central heating", "Double glazing", "En-suite", "Fitted kitchen", "Utility room"],
    status: "active", isNewBuild: false, hasGarden: true, hasParking: true,
  },

  // Leeds
  {
    title: "Modern 2-bed flat in Leeds city centre",
    description: "Contemporary two-bedroom apartment in the popular Brewery Wharf development. Open-plan living with floor-to-ceiling windows, integrated kitchen appliances, master bedroom with en-suite, secure parking, and residents' gym. Ideal for professionals — five minutes' walk to Leeds station.",
    price: 215000, listingType: "sale", propertyType: "flat",
    bedrooms: 2, bathrooms: 2, receptionRooms: 1,
    address: "8 Brewery Court", postcode: "LS10 1JR", city: "Leeds",
    epcRating: "B",
    features: ["Parking", "Central heating", "Double glazing", "En-suite", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: true,
  },
  {
    title: "Charming 3-bed terrace in Headingley",
    description: "Beautifully presented three-bedroom through-terrace in the heart of Headingley. Extended kitchen/diner with bi-fold doors onto a sunny rear garden, two reception rooms, modern bathroom, and off-street parking. Popular with professionals and families alike.",
    price: 285000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 1, receptionRooms: 2,
    address: "27 Cardigan Road", postcode: "LS6 1BB", city: "Leeds",
    epcRating: "D",
    features: ["Garden", "Parking", "Central heating", "Double glazing", "Fireplace", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: true, hasParking: true,
  },

  // Bristol
  {
    title: "Georgian 1-bed in Clifton Village",
    description: "Elegant one-bedroom garden apartment within a Grade II listed Georgian building in the heart of Clifton Village. High ceilings, original cornicing, sash windows, and a private courtyard garden. Walk to the Suspension Bridge, Clifton boutiques, and the Royal Fort Gardens.",
    price: 295000, listingType: "sale", propertyType: "flat",
    bedrooms: 1, bathrooms: 1, receptionRooms: 1,
    address: "5 Royal York Crescent", postcode: "BS8 4LJ", city: "Bristol",
    epcRating: "E",
    features: ["Garden", "Fireplace", "Central heating", "Double glazing"],
    status: "active", isNewBuild: false, hasGarden: true, hasParking: false,
  },
  {
    title: "Modern townhouse in Bristol Harbour",
    description: "Stylish three-bedroom townhouse in the contemporary Baltic Wharf development on Bristol's harbourside. Three floors of flexible accommodation with a roof terrace, en-suite master, fitted Siemens kitchen, and allocated parking for two cars. Walking distance to the city centre.",
    price: 425000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 2, receptionRooms: 2,
    address: "11 Baltic Wharf", postcode: "BS1 6WX", city: "Bristol",
    epcRating: "B",
    features: ["Balcony", "Parking", "Central heating", "Double glazing", "En-suite", "Fitted kitchen"],
    status: "active", isNewBuild: true, hasGarden: false, hasParking: true,
  },

  // Edinburgh
  {
    title: "Traditional 2-bed tenement flat in Marchmont",
    description: "Beautifully retained two-bedroom traditional tenement flat in the heart of Marchmont. Original cornicing, working shutters, bay window, and a feature fireplace. Generous proportions throughout, separate kitchen, and a modern bathroom. Moments from the Meadows and Bruntsfield.",
    price: 345000, listingType: "sale", propertyType: "flat",
    bedrooms: 2, bathrooms: 1, receptionRooms: 2,
    address: "23 Marchmont Road", postcode: "EH9 1HQ", city: "Edinburgh",
    epcRating: "D",
    features: ["Fireplace", "Central heating", "Double glazing", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: false,
  },
  {
    title: "Stylish 1-bed flat for rent in New Town",
    description: "Furnished one-bedroom flat on the second floor of a classic New Town building. Bright south-facing reception room, separate kitchen, double bedroom, and bathroom with shower over bath. Walk to Princes Street in 5 minutes. Available now on a 12-month tenancy.",
    price: 1150, listingType: "rent", propertyType: "flat",
    bedrooms: 1, bathrooms: 1, receptionRooms: 1,
    address: "14 Dundas Street", postcode: "EH3 6HZ", city: "Edinburgh",
    epcRating: "D",
    features: ["Furnished", "Central heating", "Double glazing", "White goods included"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: false,
  },

  // Liverpool
  {
    title: "Warehouse conversion in Baltic Triangle",
    description: "Striking one-bedroom warehouse conversion in Liverpool's trendy Baltic Triangle. Exposed brick, Crittall-style doors, polished concrete floors, and a fully fitted designer kitchen. Mezzanine sleeping area. Walk to the city centre in 10 minutes. Ideal for first-time buyers or investors.",
    price: 175000, listingType: "sale", propertyType: "flat",
    bedrooms: 1, bathrooms: 1, receptionRooms: 1,
    address: "7 Greenland Street", postcode: "L1 0BS", city: "Liverpool",
    epcRating: "C",
    features: ["Central heating", "Double glazing", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: false,
  },
  {
    title: "4-bed family home in Woolton",
    description: "Spacious four-bedroom detached family home in the sought-after Woolton suburb. Three reception rooms, fitted kitchen with separate dining, master en-suite, family bathroom, double garage, and mature rear garden. Excellent schools and transport links. EPC D.",
    price: 425000, listingType: "sale", propertyType: "house",
    bedrooms: 4, bathrooms: 2, receptionRooms: 3,
    address: "19 Quarry Street", postcode: "L25 6HF", city: "Liverpool",
    epcRating: "D",
    features: ["Garden", "Garage", "Parking", "Central heating", "Double glazing", "En-suite", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: true, hasParking: true,
  },

  // Glasgow
  {
    title: "West End 2-bed tenement off Byres Road",
    description: "Bright and well-proportioned two-bedroom traditional tenement flat in the heart of Glasgow's West End. High ceilings, original cornicing, bay window, and a fitted modern kitchen. Walk to Byres Road, the University of Glasgow, and Kelvingrove Park.",
    price: 215000, listingType: "sale", propertyType: "flat",
    bedrooms: 2, bathrooms: 1, receptionRooms: 1,
    address: "31 Great Western Road", postcode: "G3 6HZ", city: "Glasgow",
    epcRating: "D",
    features: ["Central heating", "Double glazing", "Fireplace", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: false,
  },

  // Cambridge
  {
    title: "Modern 3-bed townhouse with garden",
    description: "Three-storey modern townhouse in the popular CB1 development. Three bedrooms (master with en-suite), open-plan kitchen/dining/living on the first floor, downstairs WC, private rear garden, and allocated parking. Excellent access to Addenbrooke's and the city centre.",
    price: 485000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 2, receptionRooms: 1,
    address: "5 Devonshire Road", postcode: "CB1 2JH", city: "Cambridge",
    epcRating: "B",
    features: ["Garden", "Parking", "Central heating", "Double glazing", "En-suite", "Fitted kitchen"],
    status: "active", isNewBuild: true, hasGarden: true, hasParking: true,
  },

  // Brighton
  {
    title: "Sea-view 2-bed flat on Marine Parade",
    description: "Stunning two-bedroom apartment with direct sea views from the living room and master bedroom. Period features including high ceilings and cornicing, separate fitted kitchen, and modern bathroom. Lift in the building. Walk to the Pier and the Lanes in minutes.",
    price: 395000, listingType: "sale", propertyType: "flat",
    bedrooms: 2, bathrooms: 1, receptionRooms: 1,
    address: "189 Marine Parade", postcode: "BN2 1TA", city: "Brighton",
    epcRating: "C",
    features: ["Central heating", "Double glazing", "Fireplace", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: false,
  },
  {
    title: "Bright studio flat to rent in North Laine",
    description: "Compact but bright studio flat in the heart of Brighton's bohemian North Laine. Separate kitchen, modern shower room, and a generous living/sleeping area with built-in storage. Walk to Brighton station in 7 minutes. Available furnished on a 12-month tenancy.",
    price: 995, listingType: "rent", propertyType: "flat",
    bedrooms: 0, bathrooms: 1, receptionRooms: 1,
    address: "42 Gloucester Road", postcode: "BN1 4AQ", city: "Brighton",
    epcRating: "C",
    features: ["Furnished", "Central heating", "Double glazing", "Fitted kitchen", "Walk-in wardrobe"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: false,
  },

  // Cardiff
  {
    title: "Bay-side 2-bed apartment in Cardiff Bay",
    description: "Modern two-bedroom apartment with a balcony overlooking Cardiff Bay. Open-plan living, fitted kitchen with integrated appliances, master en-suite, and allocated parking. Residents' gym. Walk to Mermaid Quay and the Wales Millennium Centre.",
    price: 235000, listingType: "sale", propertyType: "flat",
    bedrooms: 2, bathrooms: 2, receptionRooms: 1,
    address: "8 Bute Street", postcode: "CF10 5LR", city: "Cardiff",
    epcRating: "B",
    features: ["Balcony", "Parking", "Central heating", "Double glazing", "En-suite", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: true,
  },

  // Newcastle
  {
    title: "Quayside loft conversion",
    description: "Striking one-bedroom loft conversion in a former warehouse on Newcastle's Quayside. Exposed brick, steel beams, polished concrete floor, and floor-to-ceiling windows with views of the Millennium Bridge. Open-plan living, separate sleeping area, and modern bathroom.",
    price: 195000, listingType: "sale", propertyType: "flat",
    bedrooms: 1, bathrooms: 1, receptionRooms: 1,
    address: "15 Sandhill", postcode: "NE1 3UF", city: "Newcastle",
    epcRating: "C",
    features: ["Central heating", "Double glazing", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: false, hasParking: false,
  },

  // Oxford
  {
    title: "Period 3-bed terrace in Jericho",
    description: "Beautifully restored three-bedroom period terrace in the desirable Jericho area of Oxford. Two reception rooms, fitted kitchen with dining area, family bathroom, and a low-maintenance courtyard garden. Walk to the city centre and Oxford University in 10 minutes.",
    price: 595000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 1, receptionRooms: 2,
    address: "27 Walton Street", postcode: "OX2 6AE", city: "Oxford",
    epcRating: "E",
    features: ["Garden", "Central heating", "Double glazing", "Fireplace", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: true, hasParking: false,
  },

  // Nottingham
  {
    title: "3-bed semi-detached in West Bridgford",
    description: "Well-presented three-bedroom semi-detached house in the family-friendly West Bridgford area. Two reception rooms, fitted kitchen, family bathroom, garage, and a good-sized rear garden. Easy access to Nottingham city centre, Trent Bridge, and the River Trent.",
    price: 295000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 1, receptionRooms: 2,
    address: "12 Loughborough Road", postcode: "NG2 7JS", city: "Nottingham",
    epcRating: "D",
    features: ["Garden", "Garage", "Parking", "Central heating", "Double glazing", "Fitted kitchen"],
    status: "active", isNewBuild: false, hasGarden: true, hasParking: true,
  },

  // Additional rental
  {
    title: "Studio flat to rent in Sheffield city centre",
    description: "Modern furnished studio apartment in the heart of Sheffield city centre. Open-plan living/sleeping area with fitted kitchen and a separate bathroom. Residents' gym and 24-hour concierge. Walk to Sheffield station in 10 minutes. Bills included option available.",
    price: 750, listingType: "rent", propertyType: "flat",
    bedrooms: 0, bathrooms: 1, receptionRooms: 1,
    address: "1 St Pauls Square", postcode: "S1 2JE", city: "Sheffield",
    epcRating: "B",
    features: ["Furnished", "Central heating", "Double glazing", "Fitted kitchen", "White goods included", "Gym"],
    status: "active", isNewBuild: true, hasGarden: false, hasParking: false,
  },
];

async function main() {
  console.log("🌱 Seeding database…\n");

  // 1. Users
  console.log("Creating demo users…");
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const admin = await db.user.upsert({
    where: { email: "admin@estateably.example" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@estateably.example",
      passwordHash,
      role: "admin",
      phone: "020 7946 0000",
      emailVerified: true,
    },
  });

  const agents = [];
  const agentData = [
    { name: "Sarah Mitchell", email: "sarah@estateably.example", phone: "07700 900123" },
    { name: "James Patel", email: "james@estateably.example", phone: "07700 900456" },
    { name: "Emma Thompson", email: "emma@estateably.example", phone: "07700 900789" },
  ];
  for (const a of agentData) {
    const agent = await db.user.upsert({
      where: { email: a.email },
      update: {},
      create: {
        name: a.name,
        email: a.email,
        passwordHash,
        role: "agent",
        phone: a.phone,
        emailVerified: true,
      },
    });
    agents.push(agent);
  }

  // QA test account (matches credentials provided to QA team)
  await db.user.upsert({
    where: { email: "up@example.com" },
    update: {},
    create: {
      name: "QA Tester",
      email: "up@example.com",
      passwordHash,
      role: "buyer",
      phone: "07700 900999",
      emailVerified: true,
    },
  });

  const buyers = [];
  const buyerData = [
    { name: "Olivia Brown", email: "olivia@example.com", phone: "07700 900222" },
    { name: "Daniel Jones", email: "daniel@example.com", phone: "07700 900333" },
  ];
  for (const b of buyerData) {
    const buyer = await db.user.upsert({
      where: { email: b.email },
      update: {},
      create: {
        name: b.name,
        email: b.email,
        passwordHash,
        role: "buyer",
        phone: b.phone,
        emailVerified: true,
      },
    });
    buyers.push(buyer);
  }
  console.log(`  ✓ ${1 + agents.length + buyers.length} users (1 admin, ${agents.length} agents, ${buyers.length} buyers)`);

  // 2. Properties (skip if already exist to keep idempotent)
  console.log("\nCreating sample properties…");
  let createdCount = 0;
  let existingCount = 0;
  for (const [i, p] of PROPERTIES.entries()) {
    const existing = await db.property.findFirst({
      where: { title: p.title, address: p.address },
    });
    if (existing) {
      existingCount++;
      continue;
    }

    const agent = agents[i % agents.length];
    const coords = CITY_COORDS[p.city] ?? { lat: 54.5, lng: -2.5 };
    // Add slight jitter to coordinates so multiple properties don't overlap on the map
    const lat = coords.lat + (Math.random() - 0.5) * 0.05;
    const lng = coords.lng + (Math.random() - 0.5) * 0.05;

    const shortId = Math.random().toString(36).slice(2, 8);
    const slug = buildPropertySlug({
      bedrooms: p.bedrooms,
      propertyType: p.propertyType,
      city: p.city,
      postcode: p.postcode,
      shortId,
    });

    const property = await db.property.create({
      data: {
        agentId: agent.id,
        title: p.title,
        slug,
        description: p.description,
        price: p.price,
        listingType: p.listingType,
        propertyType: p.propertyType,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        receptionRooms: p.receptionRooms,
        address: p.address,
        postcode: p.postcode,
        city: p.city,
        latitude: lat,
        longitude: lng,
        epcRating: p.epcRating,
        features: JSON.stringify(p.features),
        status: p.status,
        isNewBuild: p.isNewBuild,
        hasGarden: p.hasGarden,
        hasParking: p.hasParking,
        viewCount: Math.floor(Math.random() * 200) + 10,
        enquiryCount: Math.floor(Math.random() * 15),
      },
    });

    // Attach 3-5 sample images
    const numImages = 3 + Math.floor(Math.random() * 3);
    const imageOffset = Math.floor(Math.random() * SAMPLE_IMAGES.length);
    for (let j = 0; j < numImages; j++) {
      const url = SAMPLE_IMAGES[(imageOffset + j) % SAMPLE_IMAGES.length];
      await db.propertyImage.create({
        data: {
          propertyId: property.id,
          imageUrl: url,
          sortOrder: j,
        },
      });
    }
    createdCount++;
  }
  console.log(`  ✓ Created ${createdCount} new properties (${existingCount} already existed)`);

  // 3. Sample favourites, messages, reviews
  if (createdCount > 0) {
    console.log("\nCreating sample interactions…");
    const someProps = await db.property.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    // Favourites
    if (someProps[0] && someProps[1]) {
      try {
        await db.favourite.create({ data: { userId: buyers[0].id, propertyId: someProps[0].id } });
        await db.favourite.create({ data: { userId: buyers[0].id, propertyId: someProps[1].id } });
        await db.favourite.create({ data: { userId: buyers[1].id, propertyId: someProps[2]?.id || someProps[0].id } });
      } catch {}
    }

    // Messages
    if (someProps[0]) {
      try {
        await db.message.create({
          data: {
            senderId: buyers[0].id,
            receiverId: someProps[0].agentId,
            propertyId: someProps[0].id,
            subject: "Interested in this property",
            messageText: "Hi, I'm interested in viewing this property. Do you have any availability this Saturday?",
          },
        });
        await db.message.create({
          data: {
            senderId: someProps[0].agentId,
            receiverId: buyers[0].id,
            propertyId: someProps[0].id,
            subject: "Re: Interested in this property",
            messageText: "Hi Olivia, Saturday works great. Would 10am or 2pm suit you better?",
            readStatus: false,
          },
        });
      } catch {}
    }

    // Reviews
    const agentIds = [...new Set(someProps.map((p) => p.agentId))];
    for (const [i, agentId] of agentIds.entries()) {
      try {
        await db.review.create({
          data: {
            agentId,
            userId: buyers[i % buyers.length].id,
            rating: 4 + (i % 2),
            comment: i % 2 === 0
              ? "Excellent service from start to finish. Highly recommended."
              : "Very professional and responsive throughout the process.",
          },
        });
      } catch {}
    }
    console.log("  ✓ Sample favourites, messages, and reviews created");
  }

  console.log("\n✅ Seed complete!\n");
  console.log("Demo accounts (password for all: 'password123'):");
  console.log("  Admin:  admin@estateably.example");
  console.log("  Agent:  sarah@estateably.example");
  console.log("  Agent:  james@estateably.example");
  console.log("  Agent:  emma@estateably.example");
  console.log("  Buyer:  olivia@example.com");
  console.log("  Buyer:  daniel@example.com");
  console.log("  QA:     up@example.com (password: 12345678)");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
