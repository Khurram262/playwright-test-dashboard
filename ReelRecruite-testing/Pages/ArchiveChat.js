import { expect } from '@playwright/test';

export class ArchiveChatPage {
  constructor(page) {
    this.page = page;
    this.messagesButton = page.getByTestId('navbar-nav-item-messages');
    this.ChatBox = page.getByTestId('chat-item-5ebf38d4-6aed-4b5e-b68b-4067040e03e7');
    this.archiveButton = page.getByTestId('chat-archive-button').first();
    this.unArchiveButton = page.getByTestId('chat-realunarchive-button').first();
    this.maybeLaterButton = page.getByRole('button', { name: 'Maybe Later' });
  }

  // Handles optional "Maybe Later" modal
  async handleMaybeLaterIfPresent() {
    if (await this.maybeLaterButton.isVisible()) {
      await expect(this.maybeLaterButton).toBeVisible();
      await this.maybeLaterButton.click();
      await expect(this.maybeLaterButton).toBeHidden();
    }
  }

  // Open messages sidebar
  async openMessages() {
    await expect(this.messagesButton).toBeVisible();
    await this.messagesButton.click();
    await expect(this.messagesButton).toBeEnabled();
    console.log('Messages opened.');
  }

  // Open specific chat
  async openChat() {
    await expect(this.ChatBox).toBeVisible();
    await this.ChatBox.click();
    await expect(this.ChatBox).toBeVisible(); 
    console.log('Chat opened.');
  }

  // Archive chat
  async archiveChat() {
    await expect(this.archiveButton).toBeVisible();
    await this.archiveButton.click();
    await expect(this.archiveButton).toBeHidden();
    await expect(this.unArchiveButton).toBeVisible();
    console.log('Chat archived.');
  }

  // Unarchive chat
  async unArchiveChat() {
    await expect(this.unArchiveButton).toBeVisible();
    await this.unArchiveButton.click();
    await expect(this.unArchiveButton).toBeHidden();
    await expect(this.archiveButton).toBeVisible();
    console.log('Chat unarchived.');
  }
}
