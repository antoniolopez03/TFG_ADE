import { getAllBlogSummaries, getBlogCategories } from "@/lib/content/blog";
import { BlogPageClient } from "@/components/blog/BlogPageClient";

export default async function BlogPage() {
  const categories = await getBlogCategories();
  const articles = await getAllBlogSummaries();

  return <BlogPageClient articles={articles} categories={categories} />;
}
