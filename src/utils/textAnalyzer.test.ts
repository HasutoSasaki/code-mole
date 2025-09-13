import { describe, it, expect } from '@jest/globals';
import { LanguageDetector, TechTagExtractor, RelevanceCalculator } from './textAnalyzer.js';

describe('LanguageDetector', () => {
  it('should detect Japanese text', () => {
    expect(LanguageDetector.detect('これはテストです')).toBe('ja');
    expect(LanguageDetector.detect('Hello これはテスト')).toBe('ja');
    expect(LanguageDetector.isJapanese('日本語のテキスト')).toBe(true);
  });

  it('should detect English text', () => {
    expect(LanguageDetector.detect('This is a test')).toBe('en');
    expect(LanguageDetector.detect('JavaScript programming')).toBe('en');
    expect(LanguageDetector.isJapanese('English text')).toBe(false);
  });
});

describe('TechTagExtractor', () => {
  it('should extract tech keywords', () => {
    const text = 'This is about JavaScript and React development';
    const tags = TechTagExtractor.extract(text);
    
    expect(tags).toContain('javascript');
    expect(tags).toContain('react');
  });

  it('should return empty array for non-tech text', () => {
    const text = 'This is about cooking and recipes';
    const tags = TechTagExtractor.extract(text);
    
    expect(tags).toHaveLength(0);
  });

  it('should extract tags with scores', () => {
    const text = 'JavaScript JavaScript React development';
    const results = TechTagExtractor.extractWithScore(text);
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0);
  });
});

describe('RelevanceCalculator', () => {
  it('should calculate higher score for title matches', () => {
    const score = RelevanceCalculator.calculateScore(
      'JavaScript Tutorial',
      'Learn programming',
      ['js'],
      ['javascript']
    );
    
    expect(score).toBeGreaterThan(0);
  });

  it('should add bonus for Japanese content', () => {
    const scoreWithJapanese = RelevanceCalculator.calculateScore(
      'Test',
      'Description',
      [],
      ['test'],
      { isJapanese: true }
    );
    
    const scoreWithoutJapanese = RelevanceCalculator.calculateScore(
      'Test',
      'Description',
      [],
      ['test'],
      { isJapanese: false }
    );
    
    expect(scoreWithJapanese).toBeGreaterThan(scoreWithoutJapanese);
  });

  it('should add bonus for official docs', () => {
    const scoreWithOfficial = RelevanceCalculator.calculateScore(
      'Test',
      'Description',
      [],
      ['test'],
      { isOfficial: true }
    );
    
    const scoreWithoutOfficial = RelevanceCalculator.calculateScore(
      'Test',
      'Description',
      [],
      ['test'],
      { isOfficial: false }
    );
    
    expect(scoreWithOfficial).toBeGreaterThan(scoreWithoutOfficial);
  });
});