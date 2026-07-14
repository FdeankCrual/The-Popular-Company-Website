import Papa from "papaparse";

export const allProjects = [
  { 
    id: 1, 
    title: "Opal Stone", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/stone opal.mp4",
    link: "/work"
  },
  { 
    id: 2, 
    title: "Fitness", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/triform1.mp4",
    link: "/work" 
  },
  { 
    id: 3, 
    title: "Fitness", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/triform2.mp4",
    link: "/work" 
  },
  { 
    id: 4, 
    title: "Astrology", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/tarot1.mp4",
    link: "/work" 
  },
  { 
    id: 5, 
    title: "Cleaning", 
    category: "Ads", 
    type: "horizontal", 
    src: "reels/dplus1.mp4",
    link: "/work" 
  },
  { 
    id: 6, 
    title: "Delivery", 
    category: "Ads", 
    type: "horizontal", 
    src: "reels/dplus2.mp4",
    link: "/work" 
  },
  { 
    id: 7, 
    title: "Fitness", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/triform3.mp4",
    link: "/work" 
  },
  { 
    id: 8, 
    title: "Astrology", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/tarot2.mp4",
    link: "/work" 
  },
  { 
    id: 9, 
    title: "Fitness", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/triform4.mp4",
    link: "/work" 
  },
  { 
    id: 10, 
    title: "Pyrite Stone", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/stone pyrite.mp4",
    link: "/work" 
  },
  { 
    id: 11, 
    title: "Product Ad", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/dplus 3.mp4",
    link: "/work" 
  },
  { 
    id: 12, 
    title: "Product Ad", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/dplus4.mp4",
    link: "/work" 
  },
  { 
    id: 13, 
    title: "Product Ad", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/dplus5.mp4",
    link: "/work" 
  },
  { 
    id: 14, 
    title: "Furniture Ad", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/ledecus1.mp4",
    link: "/work" 
  },
  { 
    id: 15, 
    title: "Podcast intro...", 
    category: "Podcast", 
    type: "horizontal", 
    src: "reels/intro pod.mp4",
    link: "/work" 
  },
  { 
    id: 16, 
    title: "Furniture Ad", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/ledecus2.mp4",
    link: "/work" 
  },
  { 
    id: 17, 
    title: "Offer Promotion", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/smacky1.mp4",
    link: "/work" 
  },
  { 
    id: 18, 
    title: "Siddhi Fitness", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/d plus diwali.mp4",
    link: "/work" 
  }
];

export const works = allProjects;

export async function getWebProjects(): Promise<any[]> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEB_CSV_URL || process.env.GOOGLE_SHEETS_WEB_CSV_URL;
  if (!url) {
    console.warn("GOOGLE_SHEETS_WEB_CSV_URL is missing. Using empty fallback.");
    return [];
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const csvData = await res.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data
            .filter((row: any) => row && row.id)
            .map((row: any) => {
              const image = row.image && row.image.trim() !== "" 
                ? row.image 
                : `https://image.thum.io/get/width/1200/crop/800/${row.link || ""}`;
                
              return {
                id: row.id || Math.random(),
                title: row.title || "Untitled",
                category: row.category || "Uncategorized",
                image: image,
                link: row.link || "#"
              };
            });
          resolve(parsedData);
        },
        error: (err: any) => {
          console.error("Error parsing Web Projects CSV:", err);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching Web Projects CSV:", error);
    return [];
  }
}

export async function getGalleryProjects(): Promise<any[]> {
  const url = "https://docs.google.com/spreadsheets/d/1I74kK__yQUlKL_JrbvkJIIGzc1GP8XD_04T1u72Byt4/export?format=csv";
  
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const csvData = await res.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data
            .filter((row: any) => row.title && row.src)
            .map((row: any, index: number) => ({
              id: index + 100, // offset id
              title: row.title || "Untitled",
              category: row.category || "Uncategorized",
              type: row.type || "vertical",
              src: row.src || "",
              link: row.link || "#"
            }));
          resolve(parsedData);
        },
        error: (err: any) => {
          console.error("Error parsing Gallery CSV:", err);
          resolve(allProjects);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching Gallery CSV:", error);
    return allProjects;
  }
}