"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Repeat, Building2, Save } from "lucide-react";

export default function Profile() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border shadow-sm rounded-2xl p-6 text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-background shadow-md">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-display">AJ</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground font-display">Alex Johnson</h2>
            <p className="text-muted-foreground text-sm">Inventory Manager</p>
            <div className="mt-4 pt-4 border-t border-border flex justify-center gap-2">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-normal">Admin</Badge>
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5 font-normal">Active</Badge>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Products Managed</p>
                  <p className="font-bold text-foreground">1,248</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Operations Today</p>
                  <p className="font-bold text-foreground">34</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Warehouses Access</p>
                  <p className="font-bold text-foreground">All (6)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue="Alex Johnson" readOnly className="bg-secondary/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input defaultValue="alex.j@coreinv.com" readOnly className="bg-secondary/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input defaultValue="+1 (555) 019-2834" readOnly className="bg-secondary/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input defaultValue="Supply Chain" readOnly className="bg-secondary/30" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Input defaultValue="English (US)" readOnly className="bg-secondary/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Input defaultValue="America/Los_Angeles (PST)" readOnly className="bg-secondary/30" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl">
                    <Save className="w-4 h-4 mr-2" /> Request Changes
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="activity">
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Repeat className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">No recent activity</h3>
                  <p className="text-muted-foreground">Your recent actions and approvals will appear here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import Badge, let me add it
import { Badge } from "@/components/ui/badge";

