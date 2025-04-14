import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotHistory } from '../models/bot-history.entity';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { BotHistoryService } from './bot-history.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotHistoryAnalyzerService {
  private readonly logger = new Logger(BotHistoryAnalyzerService.name);
  private readonly embeddings: OpenAIEmbeddings;
  private readonly llm: ChatOpenAI;
  private isAnalyzing = false;
  private readonly defaultThreshold = 0.8;
  private readonly defaultMinCount = 3;

  constructor(
    @InjectRepository(BotHistory)
    private readonly botHistoryRepository: Repository<BotHistory>,
    private readonly botHistoryService: BotHistoryService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
    });
    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o',
      temperature: 0.2,
    });
  }


  async analyzeSimilarQuestions(threshold?: number, minCount?: number): Promise<any[]> {
    if (this.isAnalyzing) {
      this.logger.log('Analysis is already in progress');
      return [];
    }

    try {
      this.isAnalyzing = true;
      this.logger.log('Starting analysis of similar questions');


      if (!threshold || !minCount) {
        const optimalParams = await this.determineOptimalParameters();
        threshold = threshold || optimalParams.threshold;
        minCount = minCount || optimalParams.minCount;
      }

      this.logger.log(`Using threshold: ${threshold}, minCount: ${minCount}`);


      const allHistoryItems = await this.botHistoryRepository.find({
        where: { hasEmbedding: true }
      });


      if (allHistoryItems.length < minCount) {
        return [];
      }


      const groupedQuestions: Array<{
        count: number;
        questions: string[];
        recommendation: any;
      }> = [];


      const workingItems = [...allHistoryItems];


      while (workingItems.length > 0) {
        const currentItem = workingItems.shift();
        if (!currentItem) continue;


        const similarItems = await this.botHistoryService.findSimilarQuestions(
          currentItem.embedding,
          threshold,
          100
        );


        if (similarItems.length >= minCount) {

          const similarItemIds = similarItems.map(item => item.id);
          for (let i = workingItems.length - 1; i >= 0; i--) {
            if (similarItemIds.includes(workingItems[i].id)) {
              workingItems.splice(i, 1);
            }
          }


          const recommendation = await this.generateRecommendation(similarItems);

          if (recommendation) {
            groupedQuestions.push({
              count: similarItems.length,
              questions: similarItems.map(item => item.question),
              recommendation
            });
          }
        }
      }

      return groupedQuestions;
    } catch (error) {
      this.logger.error(`Error analyzing similar questions: ${error.message}`);
      return [];
    } finally {
      this.isAnalyzing = false;
    }
  }


  async analyzeUnansweredQuestions(): Promise<any[]> {
    if (this.isAnalyzing) {
      this.logger.log('Analysis is already in progress');
      return [];
    }

    try {
      this.isAnalyzing = true;
      this.logger.log('Starting analysis of unanswered questions');


      const unansweredQuestions = await this.botHistoryRepository.find({
        where: { status: false }
      });

      if (unansweredQuestions.length === 0) {
        return [];
      }


      const prompt = `
      Mache alles in Deutsch
Analysieren Sie die folgenden unbeantworteten Fragen von Benutzern:
${unansweredQuestions.map(q => `- ${q.question}`).join('\n')}

Gruppieren Sie diese Fragen nach Themen und erstellen Sie für jede Gruppe:
1. Themenname
2. Welche Fragen dazu gehören (geben Sie ihre Indizes an)
3. Empfehlung, welche Fragen zu den FAQ hinzugefügt werden sollten

Präsentieren Sie das Ergebnis im JSON-Format:
{
  "groups": [
    {
      "topic": "Themenname",
      "questionIndices": [0, 1, 3],
      "recommendation": "allgemeine Frage für FAQ"
    }
  ]
}
`;


      const aiResponse = await this.llm.invoke(prompt);
      
      // Парсим JSON из ответа
      const jsonMatch = aiResponse.content.toString().match(/```json\n([\s\S]*?)\n```/) || 
                        aiResponse.content.toString().match(/\{[\s\S]*?\}/);
      
      if (jsonMatch) {
        try {
          const analysis = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ''));
          
          // Формируем результат с реальными вопросами
          const result = analysis.groups.map(group => {
            return {
              topic: group.topic,
              questions: group.questionIndices.map(idx => unansweredQuestions[idx]?.question || `Вопрос #${idx}`),
              recommendation: group.recommendation
            };
          });
          
          return result;
        } catch (parseError) {
          this.logger.error(`Error parsing analysis JSON: ${parseError.message}`);
        }
      }
      
      return [];
    } catch (error) {
      this.logger.error(`Error analyzing unanswered questions: ${error.message}`);
      return [];
    } finally {
      this.isAnalyzing = false;
    }
  }


  private async generateRecommendation(similarQuestions: BotHistory[]): Promise<any> {
    try {

      const questionsList = similarQuestions.map(q => q.question).join('\n- ');
      const prompt = `
Analysieren Sie die folgenden ähnlichen Fragen:
- ${questionsList}

Diese Fragen wurden mehrmals von unseren Benutzern gestellt.
Erstellen Sie eine verallgemeinerte Formulierung der Frage, die alle diese Anfragen abdeckt.

Präsentieren Sie das Ergebnis im JSON-Format:
{
  "question": "verallgemeinerte Frage"
}
`;


      const aiResponse = await this.llm.invoke(prompt);

      // Parse JSON from answer
      const jsonMatch = aiResponse.content.toString().match(/```json\n([\s\S]*?)\n```/) || 
                         aiResponse.content.toString().match(/\{[\s\S]*?\}/);
      
      if (jsonMatch) {
        try {
          const recommendation = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ''));
          return recommendation;
        } catch (parseError) {
          this.logger.error(`Error parsing recommendation JSON: ${parseError.message}`);
        }
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error generating recommendation: ${error.message}`);
      return null;
    }
  }


  private async determineOptimalParameters(): Promise<{ threshold: number, minCount: number }> {
    try {

      const historyItems = await this.botHistoryRepository.find({
        where: { hasEmbedding: true }
      });
      
      if (historyItems.length === 0) {
        return { threshold: this.defaultThreshold, minCount: this.defaultMinCount };
      }
      
      const similarities: number[] = [];
      const sampleSize = Math.min(historyItems.length, 100); 
      
      const sampledItems = this.getRandomSample(historyItems, sampleSize);
      
      for (let i = 0; i < sampledItems.length; i++) {
        for (let j = i + 1; j < sampledItems.length; j++) {
          const similarity = this.cosineSimilarity(sampledItems[i].embedding, sampledItems[j].embedding);
          similarities.push(similarity);
        }
      }
      
      if (similarities.length === 0) {
        return { threshold: this.defaultThreshold, minCount: this.defaultMinCount };
      }
      
      similarities.sort((a, b) => a - b);
      
      const thresholdIndex = Math.floor(similarities.length * 0.75);
      const optimalThreshold = similarities[thresholdIndex];
      
      const optimalMinCount = Math.max(2, Math.floor(Math.sqrt(historyItems.length / 5)));
      
      return { 
        threshold: Math.max(0.65, Math.min(0.9, optimalThreshold)), // Ограничиваем от 0.65 до 0.9
        minCount: Math.min(5, optimalMinCount) // Не больше 5
      };
    } catch (error) {
      this.logger.error(`Error determining optimal parameters: ${error.message}`);
      return { threshold: this.defaultThreshold, minCount: this.defaultMinCount };
    }
  }


  private getRandomSample<T>(array: T[], size: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
