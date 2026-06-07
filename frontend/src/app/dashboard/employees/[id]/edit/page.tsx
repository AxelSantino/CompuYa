import EmployeeEditPage from "./EmployeeEditPage";

export function generateStaticParams() {
    return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <EmployeeEditPage id={resolvedParams.id} />;
}
