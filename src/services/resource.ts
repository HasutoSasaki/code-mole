import { ResourceModel } from '../models/resource.js';
import { LanguageDetector, TechTagExtractor, RelevanceCalculator } from '../utils/textAnalyzer.js';

export class ResourceCollectionService {
  private resources: ResourceModel[] = [];

  constructor(resources: ResourceModel[] = []) {
    this.resources = [...resources];
  }

  add(resource: ResourceModel): void {
    this.resources.push(resource);
  }

  addAll(resources: ResourceModel[]): void {
    this.resources.push(...resources);
  }

  get count(): number {
    return this.resources.length;
  }

  get all(): ResourceModel[] {
    return [...this.resources];
  }

  filterBySource(source: 'qiita' | 'google' | 'official-docs'): ResourceModel[] {
    return this.resources.filter(r => r.source === source);
  }

  filterByLanguage(language: string): ResourceModel[] {
    return this.resources.filter(r => r.language === language);
  }

  filterByTags(tags: string[]): ResourceModel[] {
    return this.resources.filter(r => r.hasTags(tags));
  }

  searchByKeywords(keywords: string[]): ResourceModel[] {
    return this.resources.filter(r => r.matchesKeywords(keywords));
  }

  get japaneseResources(): ResourceModel[] {
    return this.resources.filter(r => r.isJapanese);
  }

  get qiitaResources(): ResourceModel[] {
    return this.filterBySource('qiita');
  }

  get officialResources(): ResourceModel[] {
    return this.filterBySource('official-docs');
  }

  sortByRelevance(keywords: string[]): ResourceModel[] {
    return this.resources
      .map(resource => ({
        resource,
        score: RelevanceCalculator.calculateScore(
          resource.title,
          resource.description,
          resource.tags,
          keywords,
          {
            isJapanese: resource.isJapanese,
            isOfficial: resource.source === 'official-docs'
          }
        )
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.resource);
  }

  getTopRelevant(keywords: string[], limit: number = 5): ResourceModel[] {
    return this.sortByRelevance(keywords).slice(0, limit);
  }

  removeDuplicates(): void {
    const seen = new Set<string>();
    this.resources = this.resources.filter(resource => {
      const key = `${resource.url}-${resource.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  getStatistics(): ResourceCollectionStatistics {
    return {
      total: this.count,
      bySource: {
        qiita: this.qiitaResources.length,
        official: this.officialResources.length,
        google: this.filterBySource('google').length
      },
      japanese: this.japaneseResources.length,
      english: this.resources.filter(r => !r.isJapanese).length,
      topTags: this.getTopTags(5)
    };
  }

  private getTopTags(limit: number): Array<{ tag: string, count: number }> {
    const tagCounts = new Map<string, number>();

    this.resources.forEach(resource => {
      resource.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  toJSON(): object {
    return {
      count: this.count,
      resources: this.resources.map(r => r.toJSON()),
      statistics: this.getStatistics()
    };
  }
}

export interface ResourceCollectionStatistics {
  total: number;
  bySource: {
    qiita: number;
    official: number;
    google: number;
  };
  japanese: number;
  english: number;
  topTags: Array<{ tag: string, count: number }>;
}

export class ResourceFactory {
  static fromQiitaArticle(article: any): ResourceModel {
    return new ResourceModel({
      title: article.title || 'Untitled',
      url: article.url || '',
      source: 'qiita',
      description: this.extractDescription(article.body),
      language: 'ja',
      tags: this.extractQiitaTags(article.tags)
    });
  }

  static fromGoogleResult(result: any): ResourceModel {
    const content = `${result.title || ''} ${result.snippet || ''}`;

    return new ResourceModel({
      title: result.title || 'Untitled',
      url: result.link || '',
      source: 'google',
      description: result.snippet || '',
      language: LanguageDetector.detect(content),
      tags: TechTagExtractor.extract(content)
    });
  }

  static fromOfficialDocs(doc: any): ResourceModel {
    return new ResourceModel({
      title: doc.title || 'Untitled',
      url: doc.url || '',
      source: 'official-docs',
      description: doc.description || '',
      language: doc.language || 'en',
      tags: doc.tags || []
    });
  }

  private static extractDescription(body: string | null): string {
    if (!body) return '';

    // HTMLタグを除去して最初の200文字を取得
    const plainText = body.replace(/<[^>]*>/g, '').trim();
    return plainText.length > 200
      ? plainText.substring(0, 200) + '...'
      : plainText;
  }

  private static extractQiitaTags(tags: any[] | undefined): string[] {
    if (!tags || !Array.isArray(tags)) return [];

    return tags
      .map(tag => typeof tag === 'string' ? tag : tag.name)
      .filter(Boolean);
  }
}