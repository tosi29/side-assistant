import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import styles from './Response.module.css';

type ResponseProps = {
  markdownText: string;
};

const Response: React.FC<ResponseProps> = ({ markdownText }) => {
  return (
    <div className={`px-4 py-2 mx-2 my-2 ${styles.markdownBody} bg-green-100 rounded-lg`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {markdownText}
      </ReactMarkdown>
    </div>
  );
};

export default Response;
