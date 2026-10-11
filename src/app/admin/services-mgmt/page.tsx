"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Package, Wrench } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ServicesNav } from "@/components/admin/services/services-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  _count?: { packages: number };
  packages?: { id: string; name: string; price: string }[];
}

export default function AdminServicesMgmtPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/service-categories");
      setCategories(res.data.categories ?? []);
    } catch {
      toast.error("Failed to load service categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <>
      <AdminHeader
        title="Service Categories"
        description="Manage packages for each service category"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <ServicesNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="rose" title="Categories" value={loading ? "—" : categories.length} icon={Package} />
          <StatCard accent="indigo" title="Total Packages" value={loading ? "—" : categories.reduce((s, c) => s + (c._count?.packages ?? c.packages?.length ?? 0), 0)} icon={Wrench} />
          <StatCard accent="violet" title="Service Lines" value={loading ? "—" : categories.length} description="Active categories" icon={Package} />
        </div>
        {loading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
              No service categories found
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/admin/services-mgmt/${category.slug}`}>
                <Card className="h-full overflow-hidden border-slate-200/80 transition-all hover:border-rose-300 hover:shadow-lg dark:border-slate-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
                        <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <Badge variant="secondary">
                        {category._count?.packages ?? category.packages?.length ?? 0} packages
                      </Badge>
                    </div>
                    <CardTitle className="mt-3">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {category.description || "Manage pricing packages for this service."}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
