
export function buildMessageOptions(
  message: any,
  loggedInUserId: string,
  component: any
): any[] {
  const options: any[] = [];

  const isOwnMessage = message.getSender().getUid() === loggedInUserId;
  const isDeleted = !!message.getDeletedAt();
  const category = message.getCategory();
  const type = message.getType();

  if (isDeleted) {
    // No options for deleted messages
    return options;
  }

  // ➡️ Universal options
  options.push({
    id: 'reply',
    title: 'Reply',
    iconURL: 'assets/reply_in_thread.svg',
    onClick: () => {
      component.handleReplies(message);
    }
  });

  // ➡️ Only for text messages
  if (type === 'text') {
    options.push({
      id: 'copy',
      title: 'Copy',
      iconURL: 'assets/Copy.svg',
      onClick: () => {
        component.copyText(message.getData().text);
      }
    });
  }

  // ➡️ Own messages
  if (isOwnMessage) {
    if (type === 'text' && component.canEditMessage(message)) {
      options.push({
        id: 'edit',
        title: 'Edit',
        iconURL: 'assets/edit.svg',
        onClick: () => {
          component.editMessage(message);
        }
      });
    }

    if (component.canDeleteMessage(message)) {
      options.push({
        id: 'delete',
        title: 'Delete',
        iconURL: 'assets/delete_icon.svg',
        onClick: () => {
          component.deleteMessage(message.getId());
        }
      });
    }
  }

  // ➡️ Info available for media messages
  if (['image', 'video', 'file'].includes(type)) {
    options.push({
      id: 'info',
      title: 'Info',
      iconURL: 'assets/info_icon.svg',
      onClick: () => {
        component.getMessageInfo(message);
      }
    });
  }

  return options;
}