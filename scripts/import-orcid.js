// scripts/import-orcid.js
// Usage: node scripts/import-orcid.js ORCID
// Example: node scripts/import-orcid.js 0000-0003-1697-2237
// This script fetches public works from the ORCID public API (v3.0), filters
// for journal-article and book-chapter, writes publications.json and
// publications.bib into the repository root.

import fs from 'fs/promises';
import fetch from 'node-fetch';

const ORCID = process.argv[2];
if(!ORCID){
  console.error('Usage: node scripts/import-orcid.js <ORCID>');
  process.exit(2);
}

const API = `https://pub.orcid.org/v3.0/${ORCID}/works`;

async function fetchWorks(){
  const res = await fetch(API, { headers: { Accept: 'application/json' } });
  if(!res.ok) throw new Error(`ORCID fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

function extractPublication(group){
  // group is one element from the ORCID works "group" array
  const summaries = group['work-summary'] || [];
  const primary = summaries[0] || {};
  const putCode = primary['put-code'];
  const type = (primary['type'] || '').toLowerCase();
  const title = (group['work-title'] && group['work-title']['title'] && group['work-title']['title']['value']) || primary['title']?.value || '';
  const year = (group['publication-date'] && group['publication-date']['year'] && group['publication-date']['year']['value']) || (primary['publication-date'] && primary['publication-date']['year'] && primary['publication-date']['year']['value']) || '';
  const externalIds = (group['external-ids'] && group['external-ids']['external-id']) || [];
  const doi = externalIds.find(e => (e['external-id-type'] || '').toLowerCase() === 'doi')?.['external-id-value'];

  const contributors = (group['contributors'] && group['contributors']['contributor']) || [];
  const authors = contributors.map(c => {
    const name = c['credit-name'] ? c['credit-name']['value'] : (c['contributor-orcid'] && c['contributor-orcid']['uri']) || '';
    return { name };
  });

  return { id: putCode, type, title, year, doi, authors };
}

function toBibTeX(entry){
  // Minimal BibTeX generator
  const key = (entry.authors && entry.authors[0] && entry.authors[0].name ? entry.authors[0].name.split(' ').slice(-1)[0] : 'anon') + (entry.year || 'n.d.');
  const bibType = entry.type === 'journal-article' ? 'article' : (entry.type === 'book-chapter' ? 'incollection' : 'misc');
  const author = (entry.authors || []).map(a => a.name).join(' and ');
  let fields = '';
  if(entry.title) fields += `  title = {${entry.title}},\n`;
  if(author) fields += `  author = {${author}},\n`;
  if(entry.year) fields += `  year = {${entry.year}},\n`;
  if(entry.doi) fields += `  doi = {${entry.doi}},\n`;
  const bib = `@${bibType}{${key},\n${fields}}\n\n`;
  return bib;
}

(async function main(){
  try{
    const data = await fetchWorks();
    const groups = data['group'] || [];
    const pubs = groups.map(extractPublication).filter(p => ['journal-article','book-chapter'].includes(p.type));

    // write publications.json
    await fs.writeFile('publications.json', JSON.stringify(pubs, null, 2), 'utf8');

    // write publications.bib
    let bib = '';
    pubs.forEach(p => { bib += toBibTeX(p); });
    await fs.writeFile('publications.bib', bib, 'utf8');

    console.log(`Wrote ${pubs.length} publications to publications.json and publications.bib`);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
})();
