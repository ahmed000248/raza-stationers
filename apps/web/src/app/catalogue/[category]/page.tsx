import { redirect } from "next/navigation"

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  redirect(`/catalogue?category=${category}`)
}
