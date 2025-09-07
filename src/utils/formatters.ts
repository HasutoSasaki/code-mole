export class IssueTypeFormatter {
  private static readonly TYPE_DISPLAY_MAP: Record<string, string> = {
    'bug': '🐛 バグ',
    'security': '🔒 セキュリティ',
    'performance': '⚡ パフォーマンス',
    'style': '🎨 スタイル',
    'best-practice': '✨ ベストプラクティス'
  };

  static getDisplayName(type: string): string {
    return this.TYPE_DISPLAY_MAP[type] || type;
  }
}

export class SeverityFormatter {
  private static readonly SEVERITY_DISPLAY_MAP: Record<string, string> = {
    'critical': '🔴 重大',
    'high': '🟠 高',
    'medium': '🟡 中',
    'low': '🟢 低'
  };

  static getDisplayName(severity: string): string {
    return this.SEVERITY_DISPLAY_MAP[severity] || severity;
  }
}

export class ResourceSourceFormatter {
  private static readonly SOURCE_DISPLAY_MAP: Record<string, string> = {
    'qiita': 'Qiita',
    'google': 'Google検索',
    'official-docs': '公式ドキュメント'
  };

  static getDisplayName(source: string): string {
    return this.SOURCE_DISPLAY_MAP[source] || source;
  }
}

export class DateFormatter {
  static toJapaneseString(date: Date): string {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static toISOString(date: Date): string {
    return date.toISOString();
  }
}