require('dotenv').config({ path: '../.env' });
const { createProject } = require('../shared/db-helper');
const { generateUUID, getCurrentTimestamp } = require('../shared/utils');

const projects = [
  {
    name: "Aventana",
    address: "19640 Harriet Tubman Highway, Miami 33180",
    type: "Residential",
    status: "In Progress",
    bannerUrl: "projects/aventana.jpeg",
    heroUrl: "projects/aventana.jpeg",
    heroStats: [
      { id: generateUUID(), key: "Building Height", value: "16 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "334 Units" },
      { id: generateUUID(), key: "Parking", value: "426 spaces" },
      { id: generateUUID(), key: "Unit Mix", value: "Studio, 1-3 BR" }
    ],
    overview: {
      vision: "Aventana is a planned 16-story multifamily residential tower located in the Ojus area of Miami, strategically positioned near the Brightline Aventura station to support transit-oriented development. The project is designed to deliver exactly 334 residential units, including 34 units dedicated to workforce housing, within a total building area of 354,238 square feet on a 2.62-acre site.",
      sustainability: "To support the complex integration of these modern urban development trends, West Palm Consultants provided comprehensive Building Information Modeling (BIM) and Virtual Design and Construction (VDC) coordination services. While responsible for managing overall multi-trade coordination, performing rigorous clash detection, and facilitating weekly meetings to keep all trades aligned, West Palm Consultants also has the scope of plumbing 3D modeling. Clash detection was prioritized to resolve conflicts between the building services and structural elements, particularly within the 4-level structured parking garage and the expansive fifth-floor amenity deck, which features complex routing requirements for spaces like the swimming pool, fitness center, co-working spaces, and dining areas."
    },
    specs: [
      { id: generateUUID(), key: "Building Height", value: "16 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "334 Units" },
      { id: generateUUID(), key: "Parking", value: "426 parking spaces (4 floor Parking)" },
      { id: generateUUID(), key: "Unit Mix", value: "Multifamily apartments including 34 workforce housing units" },
      { id: generateUUID(), key: "Owner / Developer", value: "Ram Realty Services & Pinnacle Communities" },
      { id: generateUUID(), key: "General Contractor", value: "Kaufman Lynn" },
      { id: generateUUID(), key: "Shell Contractor", value: "KD Construction" },
      { id: generateUUID(), key: "Architect", value: "Baker Barrios Architects" }
    ],
    gallery: []
  },
  {
    name: "Caretta",
    address: "1011 U.S. Highway 1, Juno Beach, FL",
    type: "Mixed-Use",
    status: "In Progress",
    bannerUrl: "projects/caretta.jpg",
    heroUrl: "projects/caretta.jpg",
    heroStats: [
      { id: generateUUID(), key: "Building Height", value: "5 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "95 units" },
      { id: generateUUID(), key: "Parking", value: "Structured parking" },
      { id: generateUUID(), key: "Unit Mix", value: "2-4 BR, 1,820–5,000+ sq. ft." }
    ],
    overview: {
      vision: "The Caretta Project is a boutique luxury condominium and mixed-use development designed to bring high-end living and curated commercial space to Juno Beach, with a strong emphasis on lifestyle amenities and architectural elegance. To execute this complex vision, the project utilizes comprehensive Building Information Modeling (BIM) coordination across architectural, structural, and all MEP disciplines.",
      sustainability: "A critical component of the BIM scope for Caretta involves Plumbing, HVAC 3D modeling and the agile management of significant owner-driven design changes introduced mid-project. The coordination team is responsible for rapidly adapting the 3D models to these shifting requirements, performing ongoing clash detection, and dynamically rerouting building services to ensure new design elements are integrated seamlessly without causing delays to field execution."
    },
    specs: [
      { id: generateUUID(), key: "Building Height", value: "5 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "95 units" },
      { id: generateUUID(), key: "Parking", value: "Structured parking" },
      { id: generateUUID(), key: "Unit Mix", value: "2-4 BR, 1,820–5,000+ sq. ft., 9 w/ private pools" },
      { id: generateUUID(), key: "Owner / Developer", value: "JDL Development" },
      { id: generateUUID(), key: "General Contractor", value: "Hedrick Brothers Construction" }
    ],
    gallery: []
  },
  {
    name: "Selene Oceanfront Residences",
    address: "151 N Seabreeze Blvd, Fort Lauderdale",
    type: "Residential",
    status: "In Progress",
    bannerUrl: "projects/selene.jpg",
    heroUrl: "projects/selene.jpg",
    heroStats: [
      { id: generateUUID(), key: "Building Height", value: "26 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "194 units" },
      { id: generateUUID(), key: "Parking", value: "122 spaces" },
      { id: generateUUID(), key: "Unit Mix", value: "2-4 BR, 1,372–5,183 sq. ft." }
    ],
    overview: {
      vision: "Selene is Kolter Urban's flagship Fort Lauderdale beachfront project, designed as twin luxury towers with 194 residences, resort amenities, and panoramic views. The scope for West Palm includes comprehensive Plumbing 3D modeling along with coordination across all building services to ensure a clash-free and constructible design.",
      sustainability: "We are responsible for preparing detailed sleeve layouts and high-quality shop drawings to support accurate execution on site. Our team actively participates in weekly coordination meetings to align with all stakeholders and ensure smooth project progress. Additionally, we deliver precise as-built drawings reflecting the final installed conditions."
    },
    specs: [
      { id: generateUUID(), key: "Building Height", value: "26 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "194 units" },
      { id: generateUUID(), key: "Parking", value: "122 spaces" },
      { id: generateUUID(), key: "Unit Mix", value: "2-4 BR, 1,372–5,183 sq. ft., penthouses" },
      { id: generateUUID(), key: "Developer", value: "Kolter Urban" },
      { id: generateUUID(), key: "General Contractor", value: "Coastal Construction" },
      { id: generateUUID(), key: "Architect", value: "Kobi Karp" }
    ],
    gallery: []
  },
  {
    name: "FB Wynwood",
    address: "Downtown Miami, FL",
    type: "Mixed-Use",
    status: "In Progress",
    bannerUrl: "projects/fb-wynwood.jpg",
    heroUrl: "projects/fb-wynwood.jpg",
    heroStats: [
      { id: generateUUID(), key: "Building Height", value: "8 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "308 units" },
      { id: generateUUID(), key: "Parking", value: "122 spaces" },
      { id: generateUUID(), key: "Unit Mix", value: "Studios, 1-2 BR" }
    ],
    overview: {
      vision: "FB Wynwood (The Wynhouse) is a Fisher Brothers-led, Suffolk-built, 8-story mixed-use project delivering 308 rental units, retail, and public paseo space, designed to blend luxury living with Wynwood's artistic culture. Our scope includes detailed HVAC 3D modeling along with coordination with all building services to ensure a fully integrated and clash-free design.",
      sustainability: "We have developed comprehensive unit plans, piping layouts, and reflected ceiling plans (RCPs) to support accurate installation and execution on site. Our deliverables also include precise sleeve layouts for both wall and floor penetrations, along with coordinated louver openings to meet ventilation requirements. Special attention has been given to heavy equipment installations, including DOAS units on the roof, ensuring proper placement, access, and coordination with structural and architectural elements."
    },
    specs: [
      { id: generateUUID(), key: "Building Height", value: "8 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "308 units" },
      { id: generateUUID(), key: "Parking", value: "122 spaces" },
      { id: generateUUID(), key: "Unit Mix", value: "Studios, 1‑Bedroom, and 2‑Bedroom Apartments" },
      { id: generateUUID(), key: "Developer", value: "Fisher Brothers" },
      { id: generateUUID(), key: "General Contractor", value: "Suffolk Construction" }
    ],
    gallery: []
  },
  {
    name: "Azure Residences",
    address: "1401 1st Street South, Jacksonville Beach, FL 32250",
    type: "Residential",
    status: "In Progress",
    bannerUrl: "projects/azure.png",
    heroUrl: "projects/azure.png",
    heroStats: [
      { id: generateUUID(), key: "Building Height", value: "9 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "26 units" },
      { id: generateUUID(), key: "Parking", value: "On-site garage" },
      { id: generateUUID(), key: "Unit Mix", value: "2-5 BR, 2,400–6,500 sq. ft." }
    ],
    overview: {
      vision: "Azure Residences at Jacksonville Beach is a boutique 9-story oceanfront condominium by The Related Group, offering 26 ultra-luxury residences with wellness technology, curated art, and panoramic Atlantic views. For this project, West Palm Consultants is responsible for upgrading the design models of Plumbing & HVAC received from the design team to ensure full constructability.",
      sustainability: "The scope of work also includes comprehensive multi-trade coordination, participating in weekly coordination meetings with the General Contractor (GC), and managing the preparation of RFIs (Requests for Information) across all trades. We are also responsible for preparing detailed sleeve layouts and high-quality shop drawings to support accurate execution on site. We also delivered precise as-built drawings reflecting the final installed conditions."
    },
    specs: [
      { id: generateUUID(), key: "Building Height", value: "9 stories (1 story lobby and amenities, 8 stories residential)" },
      { id: generateUUID(), key: "Total Residential Units", value: "26 units" },
      { id: generateUUID(), key: "Parking", value: "On‑site parking garage for residents" },
      { id: generateUUID(), key: "Unit Mix", value: "2-5 BR, 2,400–6,500 sq. ft." },
      { id: generateUUID(), key: "Developer", value: "The Related Group" },
      { id: generateUUID(), key: "General Contractor", value: "Craft Construction" },
      { id: generateUUID(), key: "Architect", value: "Arquitectonica" }
    ],
    gallery: []
  },
  {
    name: "Tower 350",
    address: "West Palm Beach",
    type: "Residential",
    status: "In Progress",
    bannerUrl: "projects/tower-350.jpg",
    heroUrl: "projects/tower-350.jpg",
    heroStats: [
      { id: generateUUID(), key: "Building Height", value: "23 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "457 units" },
      { id: generateUUID(), key: "Parking", value: "628 spaces" },
      { id: generateUUID(), key: "Unit Mix", value: "Studio, 1-3 BR" }
    ],
    overview: {
      vision: "Tower 350 is a residential development located in West Palm Beach, developed by Hyperion Development Group with Kast Construction serving as the general contractor. The project involves comprehensive coordination across all MEPF (Mechanical, Electrical, Plumbing and Fire) systems, as well as structural, architectural, and civil disciplines.",
      sustainability: "While Wright Brothers is responsible for plumbing execution, the scope for West Palm Consultants includes the development of a fully coordinated plumbing BIM model. This encompasses the detailed modelling of plumbing systems covering underground sanitary and storm networks, overhead sanitary, water supply, condensate and pan drains, gas piping, irrigation systems, and storm/overflow drainage integrated with mechanical, electrical, civil, structural, and architectural models. The overarching BIM process is aimed at ensuring accurate system routing across all trades, facilitating seamless interdisciplinary coordination, and producing construction-ready models with sleeve and shop drawings to support efficient installation and minimize conflicts during field execution."
    },
    specs: [
      { id: generateUUID(), key: "Building Height", value: "23 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "457 units" },
      { id: generateUUID(), key: "Parking", value: "628 parking space (6 floor parking)" },
      { id: generateUUID(), key: "Unit Mix", value: "Studio, 1-bedroom, 2-bedroom, and 3-bedroom" },
      { id: generateUUID(), key: "Owner / Developer", value: "Hyperion Development Group" },
      { id: generateUUID(), key: "General Contractor", value: "Kast Construction" },
      { id: generateUUID(), key: "Plumbing Contractor", value: "Wright Brothers" }
    ],
    gallery: []
  },
  {
    name: "PGA Station",
    address: "West Palm Beach",
    type: "Residential",
    status: "In Progress",
    bannerUrl: "projects/pga.jpg",
    heroUrl: "projects/pga.jpg",
    heroStats: [
      { id: generateUUID(), key: "Building Height", value: "8 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "396 Units" },
      { id: generateUUID(), key: "Parking", value: "Multi-level garage" },
      { id: generateUUID(), key: "Unit Mix", value: "Studio, 1-2 BR" }
    ],
    overview: {
      vision: "PGA Station is a multifamily residential development located in West Palm Beach, Florida, featuring a mid-rise building configuration organized around a central courtyard. The design integrates residential units with a structured parking garage and shared amenity spaces, including a pool deck and outdoor recreational areas. The architectural layout reflects contemporary urban housing trends, emphasizing efficient unit planning, accessibility, and community-focused open spaces.",
      sustainability: "Our scope includes Plumbing and HVAC 3D modeling, along with coordination across all building services to ensure a clash-free and constructible design. We prepare detailed sleeve layouts for wall and floor penetrations, along with high-quality shop drawings to support smooth and accurate on-site execution. We have participated in weekly coordination meetings and submitted accurate as-built drawings reflecting final site conditions."
    },
    specs: [
      { id: generateUUID(), key: "Building Height", value: "8 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "396 Units" },
      { id: generateUUID(), key: "Parking", value: "Multi-level structured parking garage" },
      { id: generateUUID(), key: "Unit Mix", value: "Studio, 1-bedroom, and 2-bedroom apartments" },
      { id: generateUUID(), key: "Owner / Developer", value: "The Richman Group" },
      { id: generateUUID(), key: "General Contractor", value: "Kast Construction" },
      { id: generateUUID(), key: "HVAC & Plumbing Contractor", value: "Wright Brothers" }
    ],
    gallery: []
  },
  {
    name: "Aviara East Pompano",
    address: "Pompano Beach",
    type: "Residential",
    status: "In Progress",
    bannerUrl: "projects/aviara.jpg",
    heroUrl: "projects/aviara.jpg",
    heroStats: [
      { id: generateUUID(), key: "Building Height", value: "8 stories" },
      { id: generateUUID(), key: "Total Residential Units", value: "228 Units" },
      { id: generateUUID(), key: "Parking", value: "Structured & surface" },
      { id: generateUUID(), key: "Unit Mix", value: "Studio, 1-2 BR" }
    ],
    overview: {
      vision: "Aviara East Pompano is a multifamily residential development featuring a Residential Tower (8 stories) and Mixed Use building (6 stories) with 228 units total. Our scope includes detailed Plumbing and HVAC 3D modeling, along with coordination across all building services to ensure a fully integrated, clash-free, and constructible design. We work closely with architectural, structural, and MEP disciplines to streamline routing and optimize system layouts.",
      sustainability: "This process is focused on identifying and resolving clashes between building services and structural components such as beams, columns, and stud rails, as well as conflicts with architectural elements including ceiling spaces. The coordinated model ensures proper system integration and supports efficient routing of all building services. We prepare coordinated sleeve layouts for both wall and floor penetrations, ensuring accuracy and alignment with all services. In addition, we develop clear and precise shop drawings that support efficient on-site execution and help minimize installation conflicts."
    },
    specs: [
      { id: generateUUID(), key: "Building Height", value: "Residential Tower (8 stories), Mixed Use building (6 stories)" },
      { id: generateUUID(), key: "Total Residential Units", value: "228 Units" },
      { id: generateUUID(), key: "Parking", value: "Structured and surface parking" },
      { id: generateUUID(), key: "Unit Mix", value: "Studio, 1-bedroom, and 2-bedroom apartments" },
      { id: generateUUID(), key: "Owner / Developer", value: "MAG Development" },
      { id: generateUUID(), key: "HVAC & Plumbing Contractor", value: "Wright Brothers Contracting Services" }
    ],
    gallery: []
  },
  {
    name: "42 Pine",
    address: "340 West 42nd Street, Miami Beach, FL 33140",
    type: "Residential",
    status: "In Progress",
    bannerUrl: "projects/42-pine.jpg",
    heroUrl: "projects/42-pine.jpg",
    heroStats: [
      { id: generateUUID(), key: "Building Height", value: "8 Floors" },
      { id: generateUUID(), key: "Total Residential Units", value: "50 units" },
      { id: generateUUID(), key: "Parking", value: "Valet + 1 space/unit" },
      { id: generateUUID(), key: "Unit Mix", value: "1-3 BR + Penthouses" }
    ],
    overview: {
      vision: "Development of a boutique 8-story luxury residential condominium (42 Pine) featuring ~50 units with modern amenities, parking, and premium finishes. While White Collar Plumbing is responsible for plumbing execution, the scope for West Palm Consultants includes the development of a fully coordinated plumbing BIM model.",
      sustainability: "The overarching BIM process is aimed at ensuring accurate system routing across all trades, facilitating seamless interdisciplinary coordination, and producing construction-ready models with sleeve and shop drawings to support efficient installation and minimize conflicts during field execution."
    },
    specs: [
      { id: generateUUID(), key: "Building Height", value: "8 Floors" },
      { id: generateUUID(), key: "Total Residential Units", value: "50 units" },
      { id: generateUUID(), key: "Parking", value: "Valet + approx. 1 space/unit" },
      { id: generateUUID(), key: "Unit Mix", value: "1-3 BR + Penthouses" },
      { id: generateUUID(), key: "Developer", value: "Boymelgreen (JP Roosevelt LLC)" },
      { id: generateUUID(), key: "General Contractor", value: "Jacob Companies" },
      { id: generateUUID(), key: "Architect", value: "Arquitectonica" }
    ],
    gallery: []
  },
  {
    name: "Davie Town Hall",
    address: "6591 ORANGE DRIVE DAVIE, FL 33314",
    type: "Commercial",
    status: "In Progress",
    bannerUrl: "projects/davie-town-hall.jpeg",
    heroUrl: "projects/davie-town-hall.jpeg",
    heroStats: [
      { id: generateUUID(), key: "Building Height", value: "4 Floors" },
      { id: generateUUID(), key: "Total Area", value: "80,000+ sq ft" },
      { id: generateUUID(), key: "Parking", value: "Surface parking lot" },
      { id: generateUUID(), key: "Project Type", value: "Municipal Building" }
    ],
    overview: {
      vision: "Development of a new 4-story municipal Town Hall building (~80,000+ sq ft) including administrative offices and public facilities. Scope includes site work, parking, infrastructure upgrades, and full design-build construction delivery. This project represents a significant investment in public infrastructure for the Town of Davie.",
      sustainability: "The project integrates modern construction technology and sustainable design principles to create an efficient and welcoming municipal facility. West Palm Consultants provides comprehensive BIM coordination services to ensure seamless integration of all building systems and efficient project delivery."
    },
    specs: [
      { id: generateUUID(), key: "Building Height", value: "4 Floors" },
      { id: generateUUID(), key: "Total Area", value: "~80,000+ sq ft" },
      { id: generateUUID(), key: "Parking", value: "Surface parking lot + site improvements" },
      { id: generateUUID(), key: "Developer", value: "Town of Davie (Government Authority)" },
      { id: generateUUID(), key: "Architect", value: "Song + Associates" },
      { id: generateUUID(), key: "General Contractor", value: "Kaufman Lynn Construction" },
      { id: generateUUID(), key: "Plumbing Contractor", value: "Wright Brothers Contracting Services" },
      { id: generateUUID(), key: "Civil Consultant", value: "WGI Engineering Firm" }
    ],
    gallery: []
  }
];

async function addAllProjects() {
  console.log('Starting to add all projects...\n');
  
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    try {
      console.log(`[${i + 1}/${projects.length}] Adding project: ${project.name}...`);
      
      const projectData = {
        id: generateUUID(),
        ...project,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
      };

      const result = await createProject(projectData);
      
      if (result.success) {
        console.log(`✓ Successfully added: ${project.name}`);
      } else {
        console.log(`✗ Failed to add: ${project.name} - ${result.error}`);
      }
    } catch (error) {
      console.log(`✗ Error adding ${project.name}:`, error.message);
    }
    console.log('');
  }
  
  console.log('All projects processed!');
}

addAllProjects()
  .then(() => {
    console.log('\n✓ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });
