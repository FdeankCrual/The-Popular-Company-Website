import HomeClient from "./HomeClient";
import HomeWork from "./components/HomeWork";
import HomeBlog from "./components/HomeBlog";
import { getGalleryProjects } from "./data/works";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjoGHdI1UfEeAHTlbgA8pKd-OGcvJVJnmHcZApos76TqT6DasPMuzuanonRTrxynVxnA/exec";

async function getPagesData() {
  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getPages`, { next: { revalidate: 60 } });
    const liveData = await res.json();
    return liveData;
  } catch(e) {
    return null;
  }
}

export default async function Home() {
  const [galleryProjects, pagesData] = await Promise.all([
    getGalleryProjects(),
    getPagesData()
  ]);

  const featuredProjects = galleryProjects.filter(p => p.featured === true);

  return (
    <HomeClient 
      workSection={<HomeWork projects={featuredProjects} />}
      blogSection={<HomeBlog />}
      cmsData={pagesData?.home}
    />
  );
}