import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../models/category.entity';
import { Subcategory } from '../models/subcategory.entity';
import { FaqItem } from '../models/faq-item.entity';
import { Repository } from 'typeorm';
import { BotHistoryService } from '../bot-history/bot-history.service';
import { BotHistory } from '../models/bot-history.entity';
import { Document } from '../models/document.entity';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document as LangChainDocument } from '@langchain/core/documents';
import { ConfigService } from '@nestjs/config';


export interface ChatOptions {
  temperature?: number;
  category?: string;
}

@Injectable()
export class AiService {

  private readonly model: ChatOpenAI;
  private readonly embeddings: OpenAIEmbeddings;
  private readonly logger = new Logger(AiService.name);
  private readonly promptTemplate: PromptTemplate;

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(FaqItem)
    private faqItemRepository: Repository<FaqItem>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private botHistoryService: BotHistoryService,
    private configService: ConfigService,
  ) {
    this.model = new ChatOpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-4o',
      temperature: 0.7,
    });

    this.embeddings = new OpenAIEmbeddings({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    // Improved prompt with chain-of-thought and context citation instructions
    this.promptTemplate = PromptTemplate.fromTemplate(
      `Du bist ein Experte für das Visio Coaching System.
Nutze den unten bereitgestellten Kontext, um die Frage des Benutzers mit Klarheit und detaillierter Begründung zu beantworten.
Wenn möglich, füge eine kurze Zusammenfassung deines Denkprozesses hinzu und verweise bei Bedarf auf Kontextabschnitte.

Kontext:
{context}

Zusätzliche Anweisungen:
{additionalInstructions}

Frage:
{question}

Wenn es im Kontext bereits Antworten gibt, antworte präzise und genau wie die ursprüngliche Antwort.

Wenn es keine Antwort im Kontext gibt, immer sage: "Ich kenne die Antwort auf diese Frage nicht. Bitte geben Sie mehr Informationen oder kontaktieren Sie unseren Manager.
"

Alles sollte auf Deutsch sein.


`
    );
  }

  async generateChatResponse(
    question: string,
    options?: ChatOptions
  ): Promise<string> {
    let historyRecord: BotHistory | null = null;

    try {
      if (!question.trim()) {
        throw new Error('Question cannot be empty');
      }

      // Optionally, check if a similar question has been asked recently and use a cached answer here.

      // Create a history record with an empty answer
      historyRecord = await this.botHistoryService.create({
        question,
        answer: '',
        status: false,
      });

      // Update the model's temperature if provided
      if (options?.temperature) {
        this.model.temperature = options.temperature;
      }

      // Retrieve context: by category if specified or via a refined relevance search
      const contextData = options?.category
        ? await this.getCategoryData(options.category)
        : await this.findRelevantData(question);

      // Serialize context data; consider summarizing if it's too lengthy
      const context = JSON.stringify(contextData, null, 2);

      // Updated link handling instructions
      const linkHandlingInstructions = 
        `Wenn du eine Antwort lieferst:
  1. ALLE relevanten Links aus dem Kontext in deiner Antwort immer einbinden, wenn es welche gibt.
  2. Formatiere Links als nur die URL.
  3. Incluide alle relevanten Links, die du im Kontext findest.
  4. Abkürzungen oder Ausschlüsse von Links in deiner Antwort sind nicht erlaubt.`;

      // Format the prompt with the refined instructions
      const formattedPrompt = await this.promptTemplate.format({
        context,
        question,
        additionalInstructions: linkHandlingInstructions,
      });

      this.logger.debug(`Formatted Prompt: ${formattedPrompt}`);

      // Invoke the AI model with the formatted prompt
      const response = await this.model.invoke(formattedPrompt);
      const answerText = response.content.toString();

      // Check if the answer is "I don't know"
      const noAnswerPattern = /Ich kenne die Antwort auf diese Frage nicht/i;
      const answeredSuccessfully = !noAnswerPattern.test(answerText);

      // Update the history record with the answer and mark status based on whether an answer was found
      await this.botHistoryService.update(historyRecord.id, {
        answer: answerText,
        status: answeredSuccessfully,
      });

      return answerText;
    } catch (error) {
      this.logger.error(`Error in generateChatResponse: ${error.message}`);
      if (historyRecord) {
        await this.botHistoryService.update(historyRecord.id, {
          answer: `Error: ${error.message}`,
          status: false,
        });
      }
      throw error;
    }
  }

  // Improved method to retrieve data for a specified category
  private async getCategoryData(categoryName: string | null): Promise<any> {
    if (!categoryName) {
      // GET ALL CATEGORIES WITH THEIR DATA
      const categories = await this.categoryRepository.find({
        relations: ['subcategories', 'subcategories.faqItems', 'subcategories.faqItems.documents'],
      });
      
      return categories.reduce((result, category) => {
        result[category.name] = category.subcategories.reduce((acc, subcategory) => {
          acc[subcategory.name] = subcategory.faqItems.map(item => ({
            Question: item.question,
            Answer: item.answer,
            Links: item.documents.map(doc => ({
              url: doc.url
            })),
          }));
          return acc;
        }, {});
        return result;
      }, {});
    }
    
    const category = await this.categoryRepository.findOne({
      where: { name: categoryName },
      relations: ['subcategories', 'subcategories.faqItems', 'subcategories.faqItems.documents'],
    });

    if (!category) {
      return {};
    }

    return {
      [category.name]: category.subcategories.reduce((acc, subcategory) => {
        acc[subcategory.name] = subcategory.faqItems.map(item => ({
          Question: item.question,
          Answer: item.answer,
          Links: item.documents.map(doc => ({
            url: doc.url
          })),
        }));
        return acc;
      }, {}),
    };
  }

  // Find relevant data using embeddings
  private async findRelevantData(question: string): Promise<any> {
    // GENERATE EMBEDDING FOR THE QUESTION
    const questionEmbedding = await this.embeddings.embedQuery(question);
    
    // GET ALL RECORDS THAT ALREADY HAVE EMBEDDINGS
    const itemsWithEmbeddings = await this.faqItemRepository.find({
      where: { hasEmbedding: true },
      relations: ['subcategory', 'subcategory.category', 'documents']
    });
    
    // IF THERE ARE LESS THAN 5 RECORDS WITH EMBEDDINGS, USE A SIMPLER SEARCH
    if (itemsWithEmbeddings.length < 5) {
      // BACKUP OPTION - SIMPLE KEYWORD SEARCH
      return this.getCategoryData(null);
    }
    
    // CALCULATE SIMILARITY USING ALREADY SAVED EMBEDDINGS
    const similarityScores = itemsWithEmbeddings.map(item => {
      return {
        item,
        similarity: this.cosineSimilarity(questionEmbedding, item.embedding)
      };
    });
    
    // SORT BY RELEVANCE AND SELECT TOP 5
    const mostRelevant = similarityScores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .filter(result => result.similarity > 0.6);
    
    // FORMAT DATA FOR ANSWER
    return mostRelevant.map(result => ({
      question: result.item.question,
      answer: result.item.answer,
      category: result.item.subcategory.category.name,
      subcategory: result.item.subcategory.name,
      links: result.item.documents.map(doc => ({
        url: doc.url
      })),
      relevanceScore: Math.round(result.similarity * 100) / 100
    }));
  }
  
  // FUNCTION FOR CALCULATING COSINE SIMILARITY
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
  }


}
