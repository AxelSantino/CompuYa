import ShipmentDetailPage from "./ShipmentDetailPage";
import withAuth from "@/components/auth/withAuth";

export function generateStaticParams() {
    return [{ id: '0' }];
}

const ProtectedShipmentDetail = withAuth(ShipmentDetailPage, ['supervisor', 'operador', 'cliente']);

export default function Page() {
    return <ProtectedShipmentDetail />;
}
