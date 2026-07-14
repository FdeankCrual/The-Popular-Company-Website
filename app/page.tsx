import HomeClient from "./HomeClient";
import HomeWork from "./components/HomeWork";
import HomeBlog from "./components/HomeBlog";
import { getGalleryProjects } from "./data/works";

export default async function Home() {
  const galleryProjects = await getGalleryProjects();

  return (
    <HomeClient 
      workSection={<HomeWork projects={galleryProjects} />}
      blogSection={<HomeBlog />}
    />
  );
}