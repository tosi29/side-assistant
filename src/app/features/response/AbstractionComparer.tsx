import React from 'react';
import Response from './Response'; // Assuming Response component is in the same directory or adjust path

interface AbstractionComparerProps {
  originalText: string | null;
  results: {
    summary1: string | null;
    summary2: string | null;
    plain1: string | null;
    plain2: string | null;
  } | null;
  isLoading: boolean;
}

const AbstractionComparer: React.FC<AbstractionComparerProps> = ({
  originalText,
  results,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">抽象度を比較中...</h3>
        {originalText && (
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <h4 className="font-medium text-gray-600 mb-1">元のテキスト:</h4>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{originalText}</p>
          </div>
        )}
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-8 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-8 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-8 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-8 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!results) {
    return null; // No results to display and not loading
  }

  // Helper to render each result section
  const renderResultSection = (title: string, content: string | null) => {
    if (!content) return null; // Don't render if content is null

    // Check if content starts with "エラー:"
    const isError = content.startsWith('エラー:');

    return (
      <div className="mb-4">
        <h4 className="text-md font-semibold mb-1 text-gray-600">{title}</h4>
        {isError ? (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        ) : (
          // Use the existing Response component for consistent styling
          <Response markdownText={content} />
        )}
      </div>
    );
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-blue-50">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">抽象度比較</h3>
      {originalText && (
        <div className="mb-4 p-3 bg-white rounded border border-gray-200 shadow-sm">
          <h4 className="font-medium text-gray-600 mb-1">元のテキスト:</h4>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{originalText}</p>
        </div>
      )}
      {renderResultSection('要約レベル1 (少し簡潔に)', results.summary1)}
      {renderResultSection('要約レベル2 (非常に短く)', results.summary2)}
      {renderResultSection('平易レベル1 (少し易しく)', results.plain1)}
      {renderResultSection('平易レベル2 (小学生向け)', results.plain2)}
    </div>
  );
};

export default AbstractionComparer;
