import Papa from 'papaparse';

export interface Blog {
  slug: string;
  title: string;
  date: string;
  category: string;
  image: string;
  content: string;
  featured?: string;
}

// Fallback in case Google Sheets is not configured
const fallbackBlogs: Blog[] = [
  {
    slug: "fallback",
    title: "Please configure your Google Sheets CSV URL",
    date: "Today",
    category: "System",
    image: "/images/1.jpg",
    content: "<p>Check your .env.local file and set GOOGLE_SHEETS_CSV_URL.</p>"
  }
];

export async function getBlogs(): Promise<Blog[]> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_CSV_URL || process.env.GOOGLE_SHEETS_CSV_URL;
  if (!url) {
    console.warn("GOOGLE_SHEETS_CSV_URL is missing. Using fallback blogs.");
    return fallbackBlogs;
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } }); // Revalidate every 60 seconds
    const csvData = await res.text();
    
    return new Promise((resolve) => {
      Papa.parse<Blog>(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error: any) => {
          console.error("Error parsing CSV:", error);
          resolve(fallbackBlogs);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching blogs CSV:", error);
    return fallbackBlogs;
  }
}
