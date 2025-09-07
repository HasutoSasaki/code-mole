export class LanguageDetector {
  private static readonly JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;

  static detect(text: string): string {
    return this.JAPANESE_REGEX.test(text) ? 'ja' : 'en';
  }

  static isJapanese(text: string): boolean {
    return this.detect(text) === 'ja';
  }
}

export class TechTagExtractor {
  private static readonly TECH_KEYWORDS = [
    'javascript', 'typescript', 'react', 'vue', 'node.js', 'nodejs',
    'python', 'java', 'go', 'rust', 'aws', 'docker', 'kubernetes',
    'git', 'github', 'lambda', 'api', 'rest', 'graphql', 'sql',
    'mongodb', 'redis', 'nginx', 'express', 'nest.js', 'next.js'
  ];

  static extract(text: string): string[] {
    const lowerText = text.toLowerCase();
    return this.TECH_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword)
    );
  }

  static extractWithScore(text: string): Array<{tag: string, score: number}> {
    const lowerText = text.toLowerCase();
    
    return this.TECH_KEYWORDS
      .map(keyword => ({
        tag: keyword,
        score: this.calculateKeywordScore(lowerText, keyword)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private static calculateKeywordScore(text: string, keyword: string): number {
    const matches = text.split(keyword).length - 1;
    if (matches === 0) return 0;
    
    // より長いキーワードに高いスコア
    return matches * keyword.length;
  }
}

export class RelevanceCalculator {
  static calculateScore(
    title: string,
    description: string,
    tags: string[],
    keywords: string[],
    options: {
      isJapanese?: boolean;
      isOfficial?: boolean;
    } = {}
  ): number {
    let score = 0;
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();
    
    keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      
      // タイトルマッチは高スコア
      if (lowerTitle.includes(lowerKeyword)) {
        score += 3;
      }
      
      // 説明マッチは中スコア
      if (lowerDesc.includes(lowerKeyword)) {
        score += 1;
      }
      
      // タグマッチは高スコア
      if (tags.some(tag => tag.toLowerCase().includes(lowerKeyword))) {
        score += 2;
      }
    });
    
    // ボーナス加算
    if (options.isJapanese) {
      score += 0.5;
    }
    
    if (options.isOfficial) {
      score += 1;
    }
    
    return score;
  }
}