import { Injectable, Type } from '@nestjs/common';
import { BaseTool } from '../tools/base.tool';

@Injectable()
export class ToolRegistryService {
  private tools: Map<string, BaseTool> = new Map();

  registerTool(tool: BaseTool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  getToolSchemas() {
    return this.getAllTools().map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }
} 