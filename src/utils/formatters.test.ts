import { describe, it, expect } from '@jest/globals';
import { IssueTypeFormatter, SeverityFormatter, ResourceSourceFormatter, DateFormatter } from './formatters';

describe('IssueTypeFormatter', () => {
  it('should format known issue types', () => {
    expect(IssueTypeFormatter.getDisplayName('bug')).toBe('🐛 バグ');
    expect(IssueTypeFormatter.getDisplayName('security')).toBe('🔒 セキュリティ');
    expect(IssueTypeFormatter.getDisplayName('performance')).toBe('⚡ パフォーマンス');
  });

  it('should return original string for unknown types', () => {
    expect(IssueTypeFormatter.getDisplayName('unknown')).toBe('unknown');
  });
});

describe('SeverityFormatter', () => {
  it('should format known severity levels', () => {
    expect(SeverityFormatter.getDisplayName('critical')).toBe('🔴 重大');
    expect(SeverityFormatter.getDisplayName('high')).toBe('🟠 高');
    expect(SeverityFormatter.getDisplayName('medium')).toBe('🟡 中');
    expect(SeverityFormatter.getDisplayName('low')).toBe('🟢 低');
  });

  it('should return original string for unknown severity', () => {
    expect(SeverityFormatter.getDisplayName('unknown')).toBe('unknown');
  });
});

describe('ResourceSourceFormatter', () => {
  it('should format known source types', () => {
    expect(ResourceSourceFormatter.getDisplayName('qiita')).toBe('Qiita');
    expect(ResourceSourceFormatter.getDisplayName('google')).toBe('Google検索');
    expect(ResourceSourceFormatter.getDisplayName('official-docs')).toBe('公式ドキュメント');
  });
});

describe('DateFormatter', () => {
  const testDate = new Date('2023-01-01T12:00:00.000Z');

  it('should format date to Japanese string', () => {
    const result = DateFormatter.toJapaneseString(testDate);
    expect(result).toContain('2023');
    expect(result).toContain('1月');
  });

  it('should format date to ISO string', () => {
    const result = DateFormatter.toISOString(testDate);
    expect(result).toBe('2023-01-01T12:00:00.000Z');
  });
});