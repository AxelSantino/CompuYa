import ClientEditPage from "./ClientEditPage";

export const dynamicParams = false;

export function generateStaticParams() {
    // Para exportación estática en Tauri, devolvemos una lista vacía.
    // Next.js tratará estas rutas como dinámicas en el cliente.
    return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <ClientEditPage id={resolvedParams.id} />;
}
