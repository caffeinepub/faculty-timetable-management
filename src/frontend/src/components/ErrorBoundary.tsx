import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type React from "react";
import { Component } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="flex items-center justify-center min-h-[60vh]"
          data-ocid="error_boundary.error_state"
        >
          <Card className="max-w-md w-full shadow-lg border-destructive/30">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <CardTitle className="text-destructive text-lg">
                कुछ गलत हो गया / Something Went Wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred while rendering this page. Please
                try again.
              </p>
              {this.state.error && (
                <pre className="text-[11px] text-left bg-muted rounded-lg p-3 overflow-auto max-h-28 text-muted-foreground">
                  {this.state.error.message}
                </pre>
              )}
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="gap-2"
                data-ocid="error_boundary.reset.button"
              >
                <RefreshCw className="w-4 h-4" />
                Reset / पुनः प्रयास
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
