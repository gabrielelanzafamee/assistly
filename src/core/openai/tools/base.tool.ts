import { ITool } from "src/tools/interfaces/tools.interface";

export abstract class BaseTool implements ITool {
  abstract name: string;
  abstract description: string;
  abstract parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };

  abstract execute(args: Record<string, any>, params: any): Promise<any>;
} 