import { getInitials, useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { APP_NAME, AppLogo } from "../AppLogo";
import { UserButton } from "@clerk/react";

import { SearchField, Tabs } from "@heroui/react";
import { MessageSquareIcon, UsersIcon } from "lucide-react";
import { ConversationRow } from "./ConversationRow";

function mapUserForList(user, onlineUsers) {
  return {
    conversationId: user._id,
    id: user._id,
    name: user.fullName,
    avatarUrl: user.profilePic,
    initials: getInitials(user.fullName),

    // 🔥 FIX: normalize IDs
    isOnline: onlineUsers.map(String).includes(String(user._id)),

    peer: {
      name: user.fullName,
      avatarUrl: user.profilePic,
      initials: getInitials(user.fullName),
      isOnline: onlineUsers.map(String).includes(String(user._id)),
    },
  };
}

function ChatSidebar() {
  const conversations = useChatStore((state) => state.conversations);
  const users = useChatStore((state) => state.users);

  const searchQuery = useChatStore((state) => state.searchQuery);
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);

  const sidebarTab = useChatStore((state) => state.sidebarTab);
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);

  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);

  const onlineUsers = useAuthStore((state) => state.onlineUsers || []);

  const { activeConversationId, isLargeScreen } = useSelectedConversation();

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const conversationUsers = conversations.map((u) =>
    mapUserForList(u, onlineUsers)
  );

  const allUsers = users.map((u) =>
    mapUserForList(u, onlineUsers)
  );

  const filteredConversations = normalizedSearchQuery
    ? conversationUsers.filter((c) =>
        c.name.toLowerCase().includes(normalizedSearchQuery)
      )
    : conversationUsers;

  const filteredUsers = normalizedSearchQuery
    ? allUsers.filter((u) =>
        u.name.toLowerCase().includes(normalizedSearchQuery)
      )
    : allUsers;

  return (
    <aside
      className={`w-full shrink-0 flex-col overflow-hidden border-r border-border lg:w-72 ${
        !isLargeScreen && activeConversationId ? "hidden lg:flex" : "flex"
      }`}
    >
      {/* HEADER */}
      <div className="shrink-0 border-b border-border px-2 pb-2 pt-2.5 sm:px-3 sm:pt-3">
        <div className="flex items-center gap-2 px-0.5 sm:gap-2.5 sm:px-1">
          <AppLogo size={32} className="size-8 shrink-0 rounded-[9px] sm:size-8.5" />
          <p className="flex-1 truncate text-lg font-bold tracking-tight sm:text-[22px]">
            {APP_NAME}
          </p>
          <UserButton />
        </div>
      </div>

      {/* TABS */}
      <Tabs
        selectedKey={sidebarTab}
        onSelectionChange={(key) => setSidebarTab(String(key))}
        className="flex flex-1 flex-col overflow-y-auto"
      >
        {/* SEARCH */}
        <div className="shrink-0 border-b border-border px-3 pb-2 pt-2">
          <SearchField
            fullWidth
            value={searchQuery}
            onChange={setSearchQuery}
          >
            <SearchField.Group className="rounded-xl">
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search" />
              {searchQuery ? <SearchField.ClearButton /> : null}
            </SearchField.Group>
          </SearchField>
        </div>

        {/* TAB BUTTONS */}
        <Tabs.ListContainer className="shrink-0 border-b border-border px-2 pb-2 pt-1">
          <Tabs.List className="w-full gap-0.5">
            <Tabs.Tab id="chats" className="flex-1 justify-center gap-1.5">
              <MessageSquareIcon className="size-3.5" />
              Chats
            </Tabs.Tab>

            <Tabs.Tab id="users" className="flex-1 justify-center gap-1.5">
              <UsersIcon className="size-3.5" />
              Users
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        {/* CHATS */}
        <Tabs.Panel id="chats" className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted">
              No conversations found
            </p>
          ) : (
            filteredConversations.map((c) => (
              <ConversationRow
                key={c.id}
                user={c}
                selected={c.id === activeConversationId}
                onSelect={() => setActiveConversationId(c.id)}
              />
            ))
          )}
        </Tabs.Panel>

        {/* USERS */}
        <Tabs.Panel id="users" className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted">
              No users found
            </p>
          ) : (
            filteredUsers.map((u) => (
              <ConversationRow
                key={u.id}
                user={u}
                selected={u.id === activeConversationId}
                onSelect={() => setActiveConversationId(u.id)}
              />
            ))
          )}
        </Tabs.Panel>
      </Tabs>
    </aside>
  );
}

export default ChatSidebar;