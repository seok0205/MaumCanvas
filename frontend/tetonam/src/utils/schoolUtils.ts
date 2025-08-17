import type { School } from '@/types/school';

export function highlightSearchTerm(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function filterSchools(schools: School[], query: string): School[] {
  if (!query.trim()) return schools;

  const lowerQuery = query.toLowerCase();
  return schools.filter(school =>
    school.name.toLowerCase().includes(lowerQuery)
  );
}
