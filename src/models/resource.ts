import { LearningResource } from '../types/common';
import { ResourceSourceFormatter } from '../utils/formatters';

export class ResourceModel {
  public readonly title: string;
  public readonly url: string;
  public readonly source: 'qiita' | 'google' | 'official-docs';
  public readonly description: string;
  public readonly language?: string;
  public readonly tags: string[];
  public readonly createdAt: Date;

  constructor(resource: LearningResource) {
    this.title = resource.title;
    this.url = resource.url;
    this.source = resource.source;
    this.description = resource.description;
    if (resource.language) {
      this.language = resource.language;
    }
    this.tags = resource.tags;
    this.createdAt = new Date();
  }

  get isJapanese(): boolean {
    return this.language === 'ja' || this.source === 'qiita';
  }

  get sourceDisplayName(): string {
    return ResourceSourceFormatter.getDisplayName(this.source);
  }

  get domain(): string {
    try {
      return new URL(this.url).hostname;
    } catch {
      return '';
    }
  }

  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  hasTags(tags: string[]): boolean {
    return tags.some(tag => this.hasTag(tag));
  }

  matchesKeywords(keywords: string[]): boolean {
    const searchText = `${this.title} ${this.description} ${this.tags.join(' ')}`.toLowerCase();
    return keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    );
  }

  toJSON(): object {
    return {
      title: this.title,
      url: this.url,
      source: this.source,
      sourceDisplayName: this.sourceDisplayName,
      description: this.description,
      ...(this.language && { language: this.language }),
      tags: this.tags,
      domain: this.domain,
      isJapanese: this.isJapanese,
      createdAt: this.createdAt.toISOString()
    };
  }
}