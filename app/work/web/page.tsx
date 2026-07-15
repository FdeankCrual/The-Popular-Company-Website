import { getWebProjects } from "../../data/works";
import WebPortfolioClient from "./WebPortfolioClient";

export default async function WebPortfolioPage() {
  const projects = await getWebProjects();
  
  return <WebPortfolioClient projects={projects} />;
}
