"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { API_URL, WA_URL } from "@/lib/config";

export default function SettingsPage() {
  const [serverStatus, setServerStatus] = useState("loading");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${WA_URL}/status`);
      const data = await response.json();
      setServerStatus(
        data.success && data.status === "ready" ? "online" : "offline"
      );
    } catch (error) {
      console.error("Error checking status:", error);
      setServerStatus("offline");
    }
    setIsLoading(false);
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${WA_URL}/groups`);
      const data = await response.json();
      if (data.success) {
        setGroups(data.data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchCurrentConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/whatsapp-config`);
      const data = await response.json();
      if (data.status === "success") {
        setCurrentConfig(data.data);
        setSelectedGroup(data.data.groupId);
      }
    } catch (error) {
      console.error("Error fetching current config:", error);
    }
  };

  const saveGroupConfig = async () => {
    if (!selectedGroup) return;
    setIsSaving(true);
    try {
      const selectedGroupData = groups.find((g) => g.id === selectedGroup);
      const response = await fetch(`${API_URL}/whatsapp-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: selectedGroup,
          groupName: selectedGroupData?.name || "",
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setCurrentConfig(data.data);
      }
    } catch (error) {
      console.error("Error saving config:", error);
    }
    setIsSaving(false);
  };

  useEffect(() => {
    checkStatus();
    fetchGroups();
    fetchCurrentConfig();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          {/* Add more tabs here as needed */}
        </TabsList>

        <TabsContent value="whatsapp">
          <Card className="flex justify-between p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-medium">WhatsApp Group</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Select the WhatsApp group for notifications and updates.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Select
                      value={selectedGroup}
                      onValueChange={setSelectedGroup}
                    >
                      <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchGroups}
                      title="Refresh groups"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={saveGroupConfig}
                    disabled={!selectedGroup || isSaving}
                    className="w-full md:w-auto"
                  >
                    {isSaving ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Server Status</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Check the WhatsApp server connection status.
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center gap-2 ${
                      serverStatus === "online"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {serverStatus === "online" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    <span className="capitalize">{serverStatus}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={checkStatus}
                    disabled={isLoading}
                  >
                    Check Status
                  </Button>
                </div>
              </div>
            </div>
            <div>
              {currentConfig && (
                <div className="h-full rounded-lg border bg-muted/50 p-8">
                  <h4 className="mb-4 text-xl font-semibold text-primary">
                    Current Configuration
                  </h4>
                  <div className="space-y-2">
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium">Group:</span>{" "}
                      {currentConfig.groupName}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium">ID:</span>{" "}
                      {currentConfig.groupId}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <span className="font-medium">Last Updated:</span>{" "}
                      {new Date(currentConfig.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
