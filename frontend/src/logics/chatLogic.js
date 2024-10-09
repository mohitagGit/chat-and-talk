export const ChatTitle = (chatData, currentUser) => {
  return chatData.isGroup
    ? chatData.chatName
    : chatData.members[0]?._id === currentUser?.id
    ? chatData.members[1].name
    : chatData.members[0].name;
};

export const ChatDescription = (chatData, currentUser) => {
  return chatData.isGroup
    ? chatData.about
    : chatData.members[0]?._id === currentUser?.id
    ? chatData.members[1].email
    : chatData.members[0].email;
};

export const IsGroupAdmin = (chatData, currentUser) => {
  return chatData.isGroup && chatData.admin._id === currentUser?.id;
};
