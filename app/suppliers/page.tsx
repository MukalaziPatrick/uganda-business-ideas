import type { Metadata } from "next";

import { suppliers } from "@/app/data/suppliers";
import SupplierDirectoryClient from "./SupplierDirectoryClient";

export const metadata: Metadata = {
  title: "Suppliers & Wholesale",
  description:
    "Explore the supplier categories Business Yoo is preparing to verify, with contacts hidden until trust checks are complete.",
  robots: { index: false, follow: true },
};

export default function SuppliersPage() {
  return <SupplierDirectoryClient suppliers={suppliers} />;
}
