
/**
 * Data Extraction Script for Games Review Board
 * 
 * This script simulates scraping data from various sources
 * to populate the initial database with games, reviews, and company information.
 * 
 * In a real-world scenario, this would connect to APIs or scrape websites
 * to get real data about games, reviews, and companies.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const mysql = require('mysql2/promise');

// Configuration
const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'games_review_board'
  },
  sources: [
    { name: 'Ylands', url: 'https://ylands.com/' },
    { name: 'Steam', url: 'https://store.steampowered.com/' },
    { name: 'IGN', url: 'https://www.ign.com/' }
  ]
};

// Utility function to generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Simulate fetching data from a website
async function fetchDataFromSource(source) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching data from ${source.name} (${source.url})...`);
    
    // Simulate HTTP request
    setTimeout(() => {
      console.log(`Data fetched from ${source.name}`);
      resolve({
        success: true,
        source: source.name,
        data: {
          games: generateMockGames(source.name, 5),
          companies: generateMockCompanies(source.name, 2)
        }
      });
    }, 1000);
  });
}

// Generate mock games data
function generateMockGames(sourceName, count) {
  const games = [];
  const genres = ['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Puzzle'];
  
  for (let i = 0; i < count; i++) {
    games.push({
      id: generateUUID(),
      title: `${sourceName} Game ${i + 1}`,
      description: `This is a game from ${sourceName} with a detailed description.`,
      genre: genres[Math.floor(Math.random() * genres.length)],
      releaseDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      company: `${sourceName} Studios ${i % 3 + 1}`,
      rating: (Math.random() * 5).toFixed(1)
    });
  }
  
  return games;
}

// Generate mock companies data
function generateMockCompanies(sourceName, count) {
  const companies = [];
  
  for (let i = 0; i < count; i++) {
    companies.push({
      id: generateUUID(),
      name: `${sourceName} Studios ${i + 1}`,
      description: `A game development studio that creates games for ${sourceName}.`,
      foundedYear: 2000 + Math.floor(Math.random() * 20),
      website: `https://www.${sourceName.toLowerCase()}studios${i+1}.com`
    });
  }
  
  return companies;
}

// Save data to SQL file
function saveToSQLFile(data) {
  const sqlPath = path.join(__dirname, '..', 'migrations', 'scraped_data.sql');
  
  let sqlContent = '-- Scraped data from various sources\n\n';
  
  // Companies SQL
  data.forEach(sourceData => {
    sourceData.data.companies.forEach(company => {
      sqlContent += `INSERT INTO companies (id, name, description, founded_year, website) VALUES (
        '${company.id}',
        '${company.name.replace(/'/g, "''")}',
        '${company.description.replace(/'/g, "''")}',
        ${company.foundedYear},
        '${company.website}'
      );\n`;
    });
  });
  
  sqlContent += '\n';
  
  // Games SQL
  data.forEach(sourceData => {
    sourceData.data.games.forEach(game => {
      const companyId = sourceData.data.companies[0].id; // Simple relation
      
      sqlContent += `INSERT INTO games (id, title, author, company_id, genre, description, release_date, cover_image) VALUES (
        '${game.id}',
        '${game.title.replace(/'/g, "''")}',
        '${sourceData.source}',
        '${companyId}',
        '${game.genre}',
        '${game.description.replace(/'/g, "''")}',
        '${game.release_date}',
        'https://picsum.photos/seed/${game.title.replace(/\s+/g, '')}/300/200'
      );\n`;
    });
  });
  
  fs.writeFileSync(sqlPath, sqlContent);
  console.log(`Scraped data saved to ${sqlPath}`);
}

// Main function
async function main() {
  console.log('Starting data extraction...');
  
  try {
    const extractedData = await Promise.all(config.sources.map(fetchDataFromSource));
    console.log(`Successfully extracted data from ${extractedData.length} sources`);
    
    saveToSQLFile(extractedData);
    
    console.log('Data extraction completed successfully');
  } catch (error) {
    console.error('Error during data extraction:', error);
  }
}

// Run the script
main();
