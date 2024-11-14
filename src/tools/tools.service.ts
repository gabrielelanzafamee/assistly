import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tool } from './entities/tool.entity';
import mongoose, { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { catchError, of } from 'rxjs';
import { OpenAIService } from 'src/core/openai/services/openai.service';
import { ITool } from './interfaces/tools.interface';

@Injectable()
export class ToolsService {
	constructor (
		@InjectModel(Tool.name) private toolModel: Model<Tool>,
		private httpService: HttpService,
		@Inject(forwardRef(() => OpenAIService)) private openaiService: OpenAIService
	) {}

  async create(data: CreateToolDto, organizaitonId: string) {
		// create vectors
		const nameVector = (await this.openaiService.createVector(data.name)).data[0].embedding;
		const descriptionVector = (await this.openaiService.createVector(data.description)).data[0].embedding;
		return await new this.toolModel({
			...data,
			vectors: {
				name: nameVector,
				description: descriptionVector
			},
			organization: organizaitonId
		}).save();
  }

  async list(organizaitonId: string) {
		return await this.toolModel.find({ organization: organizaitonId });
  }

  async get(id: string, organizaitonId: string) {
		return await this.toolModel.findOne({ organization: organizaitonId, _id: id });
  }
	
	async listByAssistant(assistantId: string, organizaitonId: string) {
		return await this.toolModel.find({ organization: organizaitonId, assistant: assistantId });
  }
	
  async update(id: string, data: UpdateToolDto, organizaitonId: string) {
		const nameVector = (await this.openaiService.createVector(data.name)).data[0].embedding;
		const descriptionVector = (await this.openaiService.createVector(data.description)).data[0].embedding;
		return await this.toolModel.updateOne({ organization: organizaitonId, _id: id }, {
			...data,
			vectors: {
				name: nameVector,
				description: descriptionVector
			},
			organization: organizaitonId
		});
  }
	
  async remove(id: string, organizaitonId: string) {
		return await this.toolModel.deleteOne({ organization: organizaitonId, _id: id });
  }

	fetchData(tool: ITool) {
		const url = tool.endpointApiKey ? `${tool.endpoint}?assistly_key=${tool.endpointApiKey}` : tool.endpoint;
		return this.httpService.get(url).pipe(
      catchError((err) => {
        console.error('Error fetching data:', err);
        // Handle error by returning an empty response
        return of(null);
      })
    );
	}

	async findWithSimilarities(queryVector: number[], organizationId: mongoose.Types.ObjectId, assistantId: mongoose.Types.ObjectId, limit: number = 5) {
    return await this.toolModel.aggregate([
      {
        $match: { 
          organization: organizationId,
					assistant: assistantId
        } 
      },
      {
        $project: {
          name: 1,
          description: 1,
          endpoint: 1,
          endpointApiKey: 1,
          'vectors.name': 1,
          'vectors.description': 1,
          similarity: {
            $let: {
              vars: {
                vector1: '$vectors.name',
                vector2: queryVector,
              },
              in: {
                $divide: [
                  {
                    $sum: {
                      $map: {
                        input: { $range: [0, { $size: '$$vector1' }] },
                        as: 'i',
                        in: {
                          $multiply: [
                            { $arrayElemAt: ['$$vector1', '$$i'] },
                            { $arrayElemAt: ['$$vector2', '$$i'] },
                          ],
                        },
                      },
                    },
                  },
                  {
                    $multiply: [
                      {
                        $sqrt: {
                          $sum: {
                            $map: {
                              input: '$$vector1',
                              as: 'v',
                              in: { $multiply: ['$$v', '$$v'] },
                            },
                          },
                        },
                      },
                      {
                        $sqrt: {
                          $sum: {
                            $map: {
                              input: '$$vector2',
                              as: 'v',
                              in: { $multiply: ['$$v', '$$v'] },
                            },
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      { $sort: { similarity: -1 } },
      { $limit: limit },
    ]);
  }
}
