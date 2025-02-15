import React from 'react';

type UserRequestProps = {
  text: string;
};

const UserRequest: React.FC<UserRequestProps> = ({ text }) => {
  return <div className={`px-4 py-2 mx-2 my-2 bg-red-100 rounded-lg`}>{text}</div>;
};

export default UserRequest;
