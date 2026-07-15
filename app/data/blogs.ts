export interface Blog {
  slug: string;
  title: string;
  date: string;
  category: string;
  image: string;
  content: string;
  featured?: string;
}

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3Ry7tiEaOKETGI3ET8Co58398DVVGwOoGZnHhYtZ81lpj-DbQzVnvnjkoDB2T9GJnbQ/exec";

const fallbackBlogs: Blog[] = [
  {
    slug: "fallback",
    title: "No blog posts found",
    date: "Today",
    category: "System",
    image: "/images/1.jpg",
    content: "Publish a post from the Admin Dashboard to see it here."
  }
];

export async function getBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL + "?action=getContent", { 
      method: "GET",
      next: { revalidate: 10 } // Revalidate every 10 seconds
    });
    
    if (!res.ok) return fallbackBlogs;
    
    const data = await res.json();
    console.log("FETCHED BLOG DATA FROM SHEETS:", data);
    
    if (Array.isArray(data) && data.length > 0) {
      // Map the Google Sheet data (from the Admin UI) to the Blog interface
      // Filter out drafts, only show published
      const published = data.filter(post => post.status?.toLowerCase() === "published");
      
      if (published.length === 0) return fallbackBlogs;
      
      return published.map((post: any) => ({
        slug: post.slug || "untitled",
        title: post.title || "Untitled",
        date: post.date || "",
        category: post.category || "Marketing",
        image: post.coverImage || "/images/1.jpg", // Map coverImage to image
        content: post.content || "",
      }));
    }
    
    return fallbackBlogs;
  } catch (error) {
    console.error("Error fetching blogs from Google Sheets JSON webhook:", error);
    return fallbackBlogs;
  }
}
