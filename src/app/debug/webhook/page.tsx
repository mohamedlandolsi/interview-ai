'use client';

import React from 'react';
import { WebhookDashboard } from '@/components/debug/WebhookDashboard';
import { DashboardLayout } from '@/components/Layout';
import { DashboardRoute } from '@/components/auth/ProtectedRoute';

export default function WebhookTestPage() {
  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Webhook Testing</h1>
            <p className="text-muted-foreground">
              Test and monitor your Vapi webhook integration
            </p>
          </div>
          
          <WebhookDashboard />
        </div>
      </DashboardLayout>
    </DashboardRoute>
  );
}
