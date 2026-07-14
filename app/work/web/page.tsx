import { getWebProjects } from "../../data/works";
import WebPortfolioClient from "./WebPortfolioClient";

// Fallback in case fetch fails
const fallbackProjects = [
  {
    id: 1,
    title: "Portfolio",
    category: "Creative Portfolio",
    image: "/thumbnails/portfolio_real.png",
    link: "https://fdeankcrual.github.io/Portfolio/"
  }
];

export default async function WebPortfolioPage() {
  const fetchedProjects = await getWebProjects();
  
  // Use fallback if the Google Sheet is empty or fails to fetch
  const projects = fetchedProjects.length > 0 ? fetchedProjects : fallbackProjects;

  return <WebPortfolioClient projects={projects} />;
}
