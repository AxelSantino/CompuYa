import ShipmentDetailPage from "./ShipmentDetailPage";

export function generateStaticParams() {
    return [{ id: '0' }];
}

export default function Page() {
    return <ShipmentDetailPage />;
}
