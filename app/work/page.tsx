import { getGalleryProjects } from "../data/works";
import GalleryClient from "./GalleryClient";

export default async function WorkPage() {
  const projects = await getGalleryProjects();
  
  return <GalleryClient projects={projects} />;
}