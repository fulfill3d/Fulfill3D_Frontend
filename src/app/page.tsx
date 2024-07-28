"use client";

import React from "react";
import PageLayout from "@/components/common/page-layout";

export default function Home() {
    return (
        <PageLayout>
            <PageLayout.Public>
                <>Welcome to Fulfill3D</>
            </PageLayout.Public>
            <PageLayout.Protected>
                {/*<Dashboard/>*/}
                Dashboard
            </PageLayout.Protected>
        </PageLayout>
    )
}