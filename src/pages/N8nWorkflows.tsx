import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Workflow,
  Play,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Activity,
  Server,
  Link2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useN8nWorkflows, N8nWorkflow, N8nExecution } from "@/hooks/useN8nWorkflows";
import { format } from "date-fns";

export default function N8nWorkflows() {
  const {
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
  } = useN8nWorkflows();

  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null);

  useEffect(() => {
    if (config.apiKey) {
      fetchWorkflows().then((wfs) => {
        if (wfs.length > 0) setIsConnected(true);
      });
      fetchExecutions();
    }
  }, []);

  const handleConnect = async () => {
    saveConfig({ baseUrl, apiKey });
    const success = await testConnection();
    if (success) {
      setIsConnected(true);
      await fetchWorkflows();
      await fetchExecutions();
    }
  };

  const handleToggleWorkflow = async (workflow: N8nWorkflow) => {
    if (workflow.active) {
      await deactivateWorkflow(workflow.id);
    } else {
      await activateWorkflow(workflow.id);
    }
  };

  const handleExecute = async (workflowId: string) => {
    await executeWorkflow(workflowId);
    setTimeout(() => fetchExecutions(), 2000);
  };

  const activeWorkflows = workflows.filter((w) => w.active).length;
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter((e) => e.status === "success").length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-cyber font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              n8n Workflow Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your automation workflows from {config.baseUrl}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className={isConnected ? "bg-green-500/20 text-green-400 border-green-500/50" : ""}
            >
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" /> Connected
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" /> Disconnected
                </>
              )}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchWorkflows();
                fetchExecutions();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Workflows</p>
                  <p className="text-3xl font-bold">{workflows.length}</p>
                </div>
                <Workflow className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold">{activeWorkflows}</p>
                </div>
                <Zap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Executions</p>
                  <p className="text-3xl font-bold">{totalExecutions}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-3xl font-bold">
                    {totalExecutions > 0
                      ? Math.round((successfulExecutions / totalExecutions) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="workflows" className="data-[state=active]:bg-orange-500/20">
              <Workflow className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="executions" className="data-[state=active]:bg-orange-500/20">
              <Activity className="h-4 w-4 mr-2" />
              Executions
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            {workflows.length === 0 && !isLoading ? (
              <Card className="bg-card/50">
                <CardContent className="py-12 text-center">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No workflows found</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect to your n8n instance to see your workflows
                  </p>
                  <Button onClick={() => document.querySelector('[value="settings"]')?.dispatchEvent(new Event('click'))}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Connection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/50">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflows.map((workflow) => (
                      <TableRow key={workflow.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                              <Workflow className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                              <p className="font-medium">{workflow.name}</p>
                              <p className="text-xs text-muted-foreground">ID: {workflow.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={workflow.active}
                              onCheckedChange={() => handleToggleWorkflow(workflow)}
                            />
                            <Badge
                              variant={workflow.active ? "default" : "secondary"}
                              className={
                                workflow.active
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }
                            >
                              {workflow.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {workflow.tags?.map((tag) => (
                              <Badge key={tag.id} variant="outline" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                            {(!workflow.tags || workflow.tags.length === 0) && (
                              <span className="text-muted-foreground text-xs">No tags</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(workflow.updatedAt), "MMM d, HH:mm")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExecute(workflow.id)}
                              title="Run workflow"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedWorkflow(workflow)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{workflow.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-muted-foreground">Workflow ID</Label>
                                      <p className="font-mono text-sm">{workflow.id}</p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Status</Label>
                                      <Badge className={workflow.active ? "bg-green-500" : ""}>
                                        {workflow.active ? "Active" : "Inactive"}
                                      </Badge>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Created</Label>
                                      <p className="text-sm">
                                        {format(new Date(workflow.createdAt), "PPpp")}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Updated</Label>
                                      <p className="text-sm">
                                        {format(new Date(workflow.updatedAt), "PPpp")}
                                      </p>
                                    </div>
                                  </div>
                                  {workflow.nodes && workflow.nodes.length > 0 && (
                                    <div>
                                      <Label className="text-muted-foreground">
                                        Nodes ({workflow.nodes.length})
                                      </Label>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {workflow.nodes.map((node, i) => (
                                          <Badge key={i} variant="outline">
                                            {node.name}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <Button
                                      className="flex-1"
                                      onClick={() => handleExecute(workflow.id)}
                                    >
                                      <Play className="h-4 w-4 mr-2" />
                                      Run Workflow
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        window.open(
                                          `${config.baseUrl}/workflow/${workflow.id}`,
                                          "_blank"
                                        )
                                      }
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Open in n8n
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                window.open(`${config.baseUrl}/workflow/${workflow.id}`, "_blank")
                              }
                              title="Open in n8n"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions" className="space-y-4">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {executions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No executions found. Run a workflow to see results here.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Execution ID</TableHead>
                        <TableHead>Workflow</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {executions.map((execution) => {
                        const duration =
                          execution.stoppedAt && execution.startedAt
                            ? Math.round(
                                (new Date(execution.stoppedAt).getTime() -
                                  new Date(execution.startedAt).getTime()) /
                                  1000
                              )
                            : null;
                        return (
                          <TableRow key={execution.id}>
                            <TableCell className="font-mono text-xs">
                              {execution.id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {execution.workflowName || execution.workflowId}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  execution.status === "success"
                                    ? "bg-green-500/20 text-green-400"
                                    : execution.status === "error"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }
                              >
                                {execution.finished ? execution.status : "Running"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{execution.mode}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(execution.startedAt), "MMM d, HH:mm:ss")}
                            </TableCell>
                            <TableCell>
                              {duration !== null ? `${duration}s` : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-orange-500" />
                  n8n Connection Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="base-url">n8n Instance URL</Label>
                    <Input
                      id="base-url"
                      placeholder="https://n8n.profitreaper.com"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="bg-secondary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your self-hosted n8n instance URL (without trailing slash)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="n8n_api_..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-secondary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Generate an API key in n8n: Settings → API → Create API Key
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConnect}
                    disabled={isLoading || !baseUrl || !apiKey}
                    className="bg-gradient-to-r from-orange-500 to-red-500"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Connect & Test
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`${baseUrl}/settings/api`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open n8n Settings
                  </Button>
                </div>
                {isConnected && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Connected successfully!</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Found {workflows.length} workflows in your n8n instance
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
