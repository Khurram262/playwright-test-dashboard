import {expect} from '@playwright/test';
export class NotificationPage {
  constructor(page) {
    this.page = page;

    this.notificationButton = page.getByTestId('navbar-notifications-button');
    this.viewAllButton = page.getByTestId('notification-dropdown-footer'); 
    this.statusLabel = page.getByText('Status', { exact: true });
    this.readTab = page.locator('button').filter({ hasText: 'Read' }).first(); 
    this.unreadTab = page.getByRole('button', { name: 'Unread' }).first();
    this.markAllReadButton = page.getByRole('button', { name: 'Mark All as Read' }).first(); 
    this.maybeLaterButton = page.getByRole('button', { name: 'Maybe Later' });

  }

  async handleMaybeLaterIfPresent() {
        try {
            await this.maybeLaterButton.waitFor({
                state: 'visible',
                timeout: 2500
            });
            await this.maybeLaterButton.click();
            await this.maybeLaterButton.waitFor({ state: 'hidden' });
        } catch {
        }
    } 


  async openNotifications() {
    await this.notificationButton.waitFor({ state: 'visible' });
    await this.notificationButton.click();
    console.log('Notifications opened');
  }

  async openViewAll() {
    await this.viewAllButton.waitFor({ state: 'visible' });
    await this.viewAllButton.click();
  }

  async checkStatusTabs() {
    await this.statusLabel.waitFor({ state: 'visible' });

    await this.readTab.click();
    await this.unreadTab.click();
    console.log('Status tabs checked');
  }


  async markAllAsReadIfExists() {
    if (await this.markAllReadButton.isVisible()) {
      await this.markAllReadButton.click();
      console.log('All notifications marked as read');
    } else {
      console.log('No notifications to mark as read');
    }
  }

  async handleNotificationsFlow() {
    await this.openNotifications();
    await this.openViewAll();
    await this.checkStatusTabs();
    await this.markAllAsReadIfExists();
  }
}

export default NotificationPage;
