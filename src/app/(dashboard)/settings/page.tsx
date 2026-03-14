"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">System Preferences</h1>
        <p className="text-muted-foreground mt-1">Configure your instance of CoreInventory.</p>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl p-6 md:p-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2 text-foreground">Organization Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Company Name</Label>
              <Input defaultValue="OmniCorp Global" className="bg-secondary/50 border-border focus-visible:ring-primary" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Primary Currency</Label>
              <Input defaultValue="USD ($)" className="bg-secondary/50 border-border focus-visible:ring-primary" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-muted-foreground">Headquarters Address</Label>
              <Input defaultValue="Sector 7G, Neo-Midgar" className="bg-secondary/50 border-border focus-visible:ring-primary" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2 text-foreground">Automation & Alerts</h2>
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base text-foreground">Low Stock Warnings</Label>
                <p className="text-sm text-muted-foreground">Trigger alerts when items drop below safety thresholds.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base text-foreground">Auto-generate Purchase Orders</Label>
                <p className="text-sm text-muted-foreground">Create draft POs automatically for low stock items.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base text-foreground">Daily Digest Emails</Label>
                <p className="text-sm text-muted-foreground">Receive a summary of all movements every 24h.</p>
              </div>
              <Switch />
            </div>
          </div>
        </section>
        
        <div className="pt-4 flex justify-end">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl px-8">
            <Save className="w-4 h-4 mr-2" /> Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}

