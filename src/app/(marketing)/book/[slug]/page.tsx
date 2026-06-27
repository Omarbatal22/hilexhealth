import { redirect } from "next/navigation";
import { DOCTORS } from "@/lib/doctors";

export function generateStaticParams() {
  return DOCTORS.map((d) => ({ slug: d.slug }));
}

interface PageParams {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageParams) {
  const { slug } = await params;
  redirect(`/book?doctor=${slug}`);
}
