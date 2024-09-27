const currentUser = JSON.parse(localStorage.getItem("current-user"));

export const chatTitle = (chatData) => {
  return chatData.isGroup
    ? chatData.chatName
    : chatData.members[0]?._id === currentUser?.id
    ? chatData.members[1].name
    : chatData.members[0].name;
};

export const chatDescription = (chatData) => {
  return chatData.isGroup
    ? chatData.about
    : chatData.members[0]?._id === currentUser?.id
    ? chatData.members[1].email
    : chatData.members[0].email;
};

export const isGroupAdmin = (chatData) => {
  return chatData.isGroup && chatData.admin._id === currentUser?.id;
};
