import BlogClient from "./BlogClient";
import { getBlogs } from "../data/blogs";

export default async function BlogPage() {
  const blogs = await getBlogs();
  
  return <BlogClient blogs={blogs} />;
}
