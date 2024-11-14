export interface ITool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  execute(args: Record<string, any>): Promise<any>;
}