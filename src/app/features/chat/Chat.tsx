import React, { FC, useEffect } from 'react';
import { useState } from 'react';

type ChatProps = {
  text: string;
  onSubmit: (data: string) => void;
};

const Chat: FC<ChatProps> = ({ text, onSubmit }) => {
  const [inputText, setInputText] = useState<string>(text);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    console.log('送信!', inputText);
    setInputText('');
    onSubmit(inputText);
  };

  useEffect(() => {
    setInputText(text);
  }, [text]);

  return (
    <div className="px-2">
      <textarea
        value={inputText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
      />
    </div>
  );
};

export default Chat;
