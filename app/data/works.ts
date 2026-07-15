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
  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getWebPortfolio`, { next: { revalidate: 60 } });
    const liveData = await res.json();
    
    if (Array.isArray(liveData) && liveData.length > 0) {
      return liveData.map((item, index) => ({
         id: item.id || (index + 100),
         title: item.title || "Untitled",
         category: item.category || "Uncategorized",
         image: item.image || "",
         link: item.link || "#"
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching Web Portfolio API:", error);
    return [];
  }
}

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjoGHdI1UfEeAHTlbgA8pKd-OGcvJVJnmHcZApos76TqT6DasPMuzuanonRTrxynVxnA/exec";

export async function getGalleryProjects(): Promise<any[]> {
  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getGallery`, { next: { revalidate: 60 } });
    const liveData = await res.json();
    
    if (Array.isArray(liveData) && liveData.length > 0) {
      return liveData.map((item, index) => ({
         id: item.id || (index + 100),
         title: item.title || "Untitled",
         category: item.category || "Uncategorized",
         type: item.type || "vertical",
         src: item.src || "",
         link: item.link || "#",
         featured: item.featured === true || item.featured === "TRUE" || item.featured === "true" || item.featured === "1"
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching Gallery API:", error);
    return [];
  }
}