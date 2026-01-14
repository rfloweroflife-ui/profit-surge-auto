import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes?: Array<{ type: string; name: string }>;
  tags?: Array<{ id: string; name: string }>;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowName?: string;
  status: string;
}

export interface N8nConfig {
  baseUrl: string;
  apiKey: string;
}

export function useN8nWorkflows() {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [executions, setExecutions] = useState<N8nExecution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<N8nConfig>({
    baseUrl: localStorage.getItem("n8n_base_url") || "https://n8n.profitreaper.com",
    apiKey: localStorage.getItem("n8n_api_key") || "",
  });

  const saveConfig = useCallback((newConfig: N8nConfig) => {
    setConfig(newConfig);
    localStorage.setItem("n8n_base_url", newConfig.baseUrl);
    localStorage.setItem("n8n_api_key", newConfig.apiKey);
    toast.success("n8n configuration saved");
  }, []);

  const callN8nApi = useCallback(async (action: string, workflowId?: string) => {
    const { data, error } = await supabase.functions.invoke("n8n-workflows", {
      body: { 
        action, 
        workflowId,
        baseUrl: config.baseUrl,
        apiKey: config.apiKey 
      },
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return data.data;
  }, [config]);

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await callN8nApi("list");
      const workflowList = result.data || result || [];
      setWorkflows(Array.isArray(workflowList) ? workflowList : []);
      return workflowList;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch workflows";
      setError(message);
      toast.error("Failed to fetch workflows", { description: message });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callN8nApi]);

  const fetchExecutions = useCallback(async (workflowId?: string) => {
    setIsLoading(true);
    try {
      const result = await callN8nApi("executions", workflowId);
      const executionList = result.data || result || [];
      setExecutions(Array.isArray(executionList) ? executionList : []);
      return executionList;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch executions";
      toast.error("Failed to fetch executions", { description: message });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callN8nApi]);

  const activateWorkflow = useCallback(async (workflowId: string) => {
    try {
      await callN8nApi("activate", workflowId);
      toast.success("Workflow activated");
      await fetchWorkflows();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to activate workflow";
      toast.error("Failed to activate workflow", { description: message });
    }
  }, [callN8nApi, fetchWorkflows]);

  const deactivateWorkflow = useCallback(async (workflowId: string) => {
    try {
      await callN8nApi("deactivate", workflowId);
      toast.success("Workflow deactivated");
      await fetchWorkflows();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to deactivate workflow";
      toast.error("Failed to deactivate workflow", { description: message });
    }
  }, [callN8nApi, fetchWorkflows]);

  const executeWorkflow = useCallback(async (workflowId: string) => {
    try {
      const result = await callN8nApi("execute", workflowId);
      toast.success("Workflow executed", { description: "Check executions for results" });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to execute workflow";
      toast.error("Failed to execute workflow", { description: message });
      throw err;
    }
  }, [callN8nApi]);

  const testConnection = useCallback(async () => {
    setIsLoading(true);
    try {
      await callN8nApi("list");
      toast.success("Connected to n8n!", { description: config.baseUrl });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      toast.error("Connection failed", { description: message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [callN8nApi, config.baseUrl]);

  return {
    workflows,
    executions,
    isLoading,
    error,
    config,
    saveConfig,
    fetchWorkflows,
    fetchExecutions,
    activateWorkflow,
    deactivateWorkflow,
    executeWorkflow,
    testConnection,
  };
}
