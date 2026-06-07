import ClientEditPage from "./ClientEditPage";

export const dynamicParams = false;

export function generateStaticParams() {
    return [{ id: '0' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <ClientEditPage id={resolvedParams.id} />;
}
