require('dotenv').config();
const { createNewsletter } = require('../shared/db-helper');
const { generateUUID, getCurrentTimestamp } = require('../shared/utils');

const sampleNewsletters = [
  {
    id: generateUUID(),
    title: "WPCS December 2024 - Year in Review",
    content: `
      <h2>A Year of Innovation and Growth</h2>
      <p>As we close out 2024, we're proud to reflect on a year of remarkable achievements in construction technology. Our team has delivered cutting-edge solutions across multiple projects, pushing the boundaries of what's possible in modern construction.</p>
      
      <h3>Key Highlights</h3>
      <ul>
        <li><strong>50+ Projects Completed</strong> - From residential complexes to commercial towers</li>
        <li><strong>Advanced BIM Integration</strong> - Reduced project timelines by 30%</li>
        <li><strong>Sustainability Focus</strong> - All projects achieved LEED certification targets</li>
        <li><strong>Team Expansion</strong> - Welcomed 25 new talented professionals</li>
      </ul>
      
      <h3>Featured Project: Agile Embassy Garden</h3>
      <p>Our flagship project of 2024, the Agile Embassy Garden, showcases the perfect blend of luxury living and sustainable design. With 200+ residential units and state-of-the-art amenities, this project sets a new standard for urban development.</p>
      
      <h3>Looking Ahead to 2025</h3>
      <p>We're excited about the opportunities ahead. With new partnerships, emerging technologies, and a commitment to excellence, 2025 promises to be our best year yet.</p>
      
      <p><em>Thank you for being part of our journey. Here's to building the future together!</em></p>
    `,
    month: 12,
    year: 2024,
    coverImage: null,
    publishedDate: getCurrentTimestamp(),
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  },
  {
    id: generateUUID(),
    title: "WPCS November 2024 - Technology Spotlight",
    content: `
      <h2>Embracing Digital Transformation</h2>
      <p>This month, we're diving deep into the technologies that are revolutionizing our industry and how WPCS is leading the charge.</p>
      
      <h3>VDC Coordination Excellence</h3>
      <p>Our Virtual Design and Construction team has been instrumental in preventing costly on-site conflicts. Using advanced clash detection and 4D scheduling, we've saved our clients millions in potential rework costs.</p>
      
      <h3>Prefabrication Innovation</h3>
      <p>We've expanded our prefabrication capabilities with a new 50,000 sq ft facility. This allows us to manufacture building components in a controlled environment, ensuring higher quality and faster installation times.</p>
      
      <h3>Client Success Story</h3>
      <blockquote>
        <p>"Working with WPCS has transformed how we approach construction. Their technology-first mindset and attention to detail have made our project a resounding success."</p>
        <footer>- John Smith, Project Director, ABC Developers</footer>
      </blockquote>
      
      <h3>Upcoming Webinar</h3>
      <p>Join us on December 15th for a free webinar on "The Future of Construction Technology." Register now to secure your spot!</p>
    `,
    month: 11,
    year: 2024,
    coverImage: null,
    publishedDate: getCurrentTimestamp(),
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  },
  {
    id: generateUUID(),
    title: "WPCS October 2024 - Sustainability Focus",
    content: `
      <h2>Building a Greener Future</h2>
      <p>Sustainability isn't just a buzzword at WPCS—it's a core principle that guides every decision we make.</p>
      
      <h3>Our Sustainability Initiatives</h3>
      <ul>
        <li><strong>Carbon Footprint Reduction</strong> - 40% reduction in project emissions through smart planning</li>
        <li><strong>Material Optimization</strong> - Advanced quantity take-off reduces waste by 25%</li>
        <li><strong>Energy Efficiency</strong> - All designs incorporate renewable energy solutions</li>
        <li><strong>Water Conservation</strong> - Rainwater harvesting and greywater recycling systems</li>
      </ul>
      
      <h3>Green Building Certifications</h3>
      <p>We're proud to announce that 100% of our 2024 projects are on track for LEED certification, with 60% targeting Gold or Platinum status.</p>
      
      <h3>Industry Recognition</h3>
      <p>WPCS was honored with the "Sustainable Construction Leader" award at the National Construction Excellence Awards. This recognition validates our commitment to environmental responsibility.</p>
      
      <h3>Partner Spotlight</h3>
      <p>This month, we're highlighting our partnership with EcoMaterials Inc., a supplier of sustainable building materials. Together, we're proving that eco-friendly construction doesn't mean compromising on quality or aesthetics.</p>
    `,
    month: 10,
    year: 2024,
    coverImage: null,
    publishedDate: getCurrentTimestamp(),
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  }
];

async function addSampleNewsletters() {
  console.log('\n📰 Adding sample newsletters...\n');
  
  for (const newsletter of sampleNewsletters) {
    try {
      await createNewsletter(newsletter);
      console.log(`✅ Created: ${newsletter.title}`);
    } catch (error) {
      console.error(`❌ Failed to create: ${newsletter.title}`, error.message);
    }
  }
  
  console.log('\n✅ Sample newsletters added successfully!\n');
}

addSampleNewsletters()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
