export type QueryStatus = "pending" | "resolved";

export interface Query {
  id: string;
  fullName: string;
  email: string;
  company: string;
  services: string[];
  message: string;
  attachment?: string | null;
  date: string; // ISO
  status: QueryStatus;
}

export const SERVICES = [
  "BIM MEPF",
  "Prefabrication",
  "Estimation",
  "Renderings",
  "Submittals Review",
  "Project Management",
  "Drone Video",
];

export const initialQueries: Query[] = [
  {
    id: "q-1001",
    fullName: "Marcus Bennett",
    email: "marcus.bennett@apexbuild.com",
    company: "Apex Build Group",
    services: ["BIM MEPF", "Estimation"],
    message:
      "We're starting a 12-story mixed-use tower in West Palm Beach and need full BIM coordination plus quantity takeoffs. Timeline is aggressive — looking for a partner who can mobilize fast.",
    attachment: "apex-tower-rfp.pdf",
    date: "2025-04-12T10:24:00Z",
    status: "pending",
  },
  {
    id: "q-1002",
    fullName: "Lauren Cho",
    email: "lcho@meridiandev.com",
    company: "Meridian Development",
    services: ["Renderings", "Drone Video"],
    message:
      "Need photoreal exterior renderings and a drone flythrough for marketing of our luxury condo project.",
    attachment: null,
    date: "2025-04-10T15:05:00Z",
    status: "resolved",
  },
  {
    id: "q-1003",
    fullName: "David Reyes",
    email: "d.reyes@kaufmanlynn.com",
    company: "Kaufman Lynn Construction",
    services: ["Prefabrication", "BIM MEPF", "Submittals Review"],
    message: "Looking to prefab MEPF risers for a hospital expansion. Please share capabilities deck.",
    attachment: "hospital-scope.docx",
    date: "2025-04-08T09:11:00Z",
    status: "pending",
  },
  {
    id: "q-1004",
    fullName: "Priya Shah",
    email: "priya@ramrealty.com",
    company: "Ram Realty Services",
    services: ["Project Management"],
    message: "Need a PM partner for a 334-unit residential project. Owner-side representation.",
    date: "2025-04-05T13:42:00Z",
    status: "resolved",
  },
  {
    id: "q-1005",
    fullName: "Jonah Whitfield",
    email: "jwhitfield@bbarchitects.com",
    company: "Baker Barrios Architects",
    services: ["BIM MEPF", "Renderings"],
    message: "Need clash detection on the new mixed-use submission.",
    date: "2025-04-02T08:00:00Z",
    status: "pending",
  },
  {
    id: "q-1006",
    fullName: "Sara Kim",
    email: "sara.kim@coastalbuild.com",
    company: "Coastal Build Co.",
    services: ["Estimation"],
    message: "Need a budget estimate for a 40,000 sqft warehouse. Drawings attached.",
    attachment: "warehouse-dwgs.zip",
    date: "2025-03-28T11:20:00Z",
    status: "resolved",
  },
  {
    id: "q-1007",
    fullName: "Ethan Park",
    email: "ethan@parkco.dev",
    company: "Park & Co Developers",
    services: ["Drone Video", "Renderings"],
    message: "Quarterly progress drone capture for an active site.",
    date: "2025-03-22T14:50:00Z",
    status: "pending",
  },
  {
    id: "q-1008",
    fullName: "Olivia Martinez",
    email: "olivia@suncoastmep.com",
    company: "Suncoast MEP",
    services: ["BIM MEPF", "Prefabrication"],
    message: "Interested in long-term BIM support across multiple multifamily projects.",
    attachment: "scope.pdf",
    date: "2025-03-18T16:00:00Z",
    status: "resolved",
  },
  {
    id: "q-1009",
    fullName: "Noah Ellis",
    email: "noah.ellis@harborgc.com",
    company: "Harbor GC",
    services: ["Submittals Review", "Project Management"],
    message: "Submittal log is overwhelming. Looking for outsourced reviewer with construction expertise.",
    date: "2025-02-25T09:30:00Z",
    status: "pending",
  },
  {
    id: "q-1010",
    fullName: "Hannah Brooks",
    email: "hannah@brookshomes.com",
    company: "Brooks Homes",
    services: ["Renderings"],
    message: "Need three exterior options rendered for a custom waterfront home.",
    date: "2025-02-14T10:00:00Z",
    status: "resolved",
  },
];

export interface OverviewBlock {
  id: string;
  heading: string;
  description: string;
}

export interface KVPair {
  id: string;
  key: string;
  value: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  type: "Residential" | "Commercial" | "Mixed-Use" | "Industrial";
  bannerUrl: string;
  status: "In Progress" | "Completed" | "Planning";
  heroUrl: string;
  heroStats: KVPair[];
  overview: OverviewBlock[];
  specs: KVPair[];
  gallery: GalleryItem[];
}

const sampleHero =
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80";
const sampleBanner =
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80";

export const initialProjects: Project[] = [
  {
    id: "p-001",
    name: "Banyan Cay Residences",
    address: "2900 Banyan Cay Dr, West Palm Beach, FL",
    type: "Residential",
    bannerUrl: sampleBanner,
    status: "In Progress",
    heroUrl: sampleHero,
    heroStats: [
      { id: "h1", key: "Height", value: "16 stories" },
      { id: "h2", key: "Units", value: "334 Units" },
      { id: "h3", key: "Parking", value: "426 spaces" },
      { id: "h4", key: "Unit Mix", value: "34 workforce housing units" },
    ],
    overview: [
      {
        id: "o1",
        heading: "Project Vision",
        description:
          "Banyan Cay Residences is a transformative residential community blending luxury living with workforce housing — designed to set a new standard for inclusive development in West Palm Beach.",
      },
      {
        id: "o2",
        heading: "Sustainability",
        description:
          "Designed to LEED Silver standards with rooftop solar, EV-ready parking, and water-reclamation landscaping.",
      },
    ],
    specs: [
      { id: "s1", key: "Building Height", value: "16 stories" },
      { id: "s2", key: "Total Residential Units", value: "334 Units" },
      { id: "s3", key: "Owner / Developer", value: "Ram Realty Services" },
      { id: "s4", key: "General Contractor", value: "Kaufman Lynn" },
      { id: "s5", key: "Architect", value: "Baker Barrios Architects" },
    ],
    gallery: [
      {
        id: "g1",
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
        type: "image",
        name: "Exterior render",
      },
      {
        id: "g2",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
        type: "image",
        name: "Lobby",
      },
      {
        id: "g3",
        url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80",
        type: "image",
        name: "Pool deck",
      },
    ],
  },
  {
    id: "p-002",
    name: "Flagler Commerce Center",
    address: "1500 N Flagler Dr, West Palm Beach, FL",
    type: "Commercial",
    bannerUrl: "https://images.unsplash.com/photo-1554435493-93422e8220c8?w=800&q=80",
    status: "Planning",
    heroUrl: "https://images.unsplash.com/photo-1554435493-93422e8220c8?w=1600&q=80",
    heroStats: [
      { id: "h1", key: "Floors", value: "22 stories" },
      { id: "h2", key: "Office", value: "480,000 sqft" },
    ],
    overview: [
      {
        id: "o1",
        heading: "Class-A Office",
        description:
          "A premier downtown commercial tower offering flexible floorplates and panoramic Intracoastal views.",
      },
    ],
    specs: [
      { id: "s1", key: "Building Height", value: "22 stories" },
      { id: "s2", key: "Architect", value: "HOK" },
    ],
    gallery: [],
  },
];
