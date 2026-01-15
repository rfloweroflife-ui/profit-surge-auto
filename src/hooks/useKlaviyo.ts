import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KlaviyoConnection {
  id: string;
  api_key: string;
  account_id?: string;
  is_active: boolean;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  recipients_count: number;
  opens: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

interface EmailFlow {
  id: string;
  name: string;
  trigger_type: string;
  is_active: boolean;
  total_triggered: number;
  revenue_generated: number;
}

export function useKlaviyo() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState<KlaviyoConnection | null>(null);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [flows, setFlows] = useState<EmailFlow[]>([]);

  const connect = async (apiKey: string, privateKey?: string) => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo', {
        body: { action: 'connect', apiKey, privateKey }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setConnection(data.connection);
      toast.success('Connected to Klaviyo successfully!');
      return data;
    } catch (error: any) {
      toast.error(`Klaviyo connection failed: ${error.message}`);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const getLists = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo', {
        body: { action: 'get_lists' }
      });

      if (error) throw error;
      return data.lists || [];
    } catch (error: any) {
      toast.error(`Failed to get lists: ${error.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getSegments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo', {
        body: { action: 'get_segments' }
      });

      if (error) throw error;
      return data.segments || [];
    } catch (error: any) {
      toast.error(`Failed to get segments: ${error.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo', {
        body: { action: 'get_templates' }
      });

      if (error) throw error;
      return data.templates || [];
    } catch (error: any) {
      toast.error(`Failed to get templates: ${error.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createCampaign = async (campaignData: {
    name: string;
    subject: string;
    preview_text?: string;
    template_id?: string;
    listIds?: string[];
    scheduled_at?: string;
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo', {
        body: { action: 'create_campaign', campaignData }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('Campaign created successfully!');
      await fetchCampaigns();
      return data;
    } catch (error: any) {
      toast.error(`Failed to create campaign: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string, dbId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo', {
        body: { 
          action: 'send_campaign', 
          campaignData: { id: campaignId, dbId } 
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('Campaign sent successfully!');
      await fetchCampaigns();
      return data;
    } catch (error: any) {
      toast.error(`Failed to send campaign: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncSubscribers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo', {
        body: { action: 'sync_subscribers' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(data.message);
      return data;
    } catch (error: any) {
      toast.error(`Failed to sync subscribers: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createFlow = async (flowData: {
    name: string;
    trigger_type: string;
    trigger_conditions?: any;
    flow_steps?: any;
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo', {
        body: { action: 'create_flow', flowData }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('Flow created successfully!');
      await fetchFlows();
      return data;
    } catch (error: any) {
      toast.error(`Failed to create flow: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCampaigns(data as EmailCampaign[]);
    }
    return data || [];
  };

  const fetchFlows = async () => {
    const { data, error } = await supabase
      .from('email_flows')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFlows(data as EmailFlow[]);
    }
    return data || [];
  };

  const checkConnection = async () => {
    const { data, error } = await supabase
      .from('klaviyo_connections')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!error && data) {
      setConnection(data as KlaviyoConnection);
      return true;
    }
    return false;
  };

  return {
    isConnecting,
    isLoading,
    connection,
    campaigns,
    flows,
    connect,
    getLists,
    getSegments,
    getTemplates,
    createCampaign,
    sendCampaign,
    syncSubscribers,
    createFlow,
    fetchCampaigns,
    fetchFlows,
    checkConnection
  };
}
